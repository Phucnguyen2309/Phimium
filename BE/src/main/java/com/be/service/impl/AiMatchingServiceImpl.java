package com.be.service.impl;

import com.be.config.MatchingProperties;
import com.be.dto.request.AiMatchRequest;
import com.be.dto.request.AiMatchRequest.RequiredExperience;
import com.be.dto.response.AiMatchResponse;
import com.be.dto.response.AiMatchResponse.Reason;
import com.be.dto.response.BuddyResponse;
import com.be.entity.User;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import com.be.enums.MatchingTag;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.AiMatchResultStore;
import com.be.service.AiMatchingService;
import com.be.service.MatchingAiClient;
import com.be.service.MatchingAiClient.ExperienceEvidence;
import com.be.service.MatchingAiClient.RankedChoice;
import com.be.service.MatchingCandidateService;
import com.be.service.MatchingCandidateService.Candidate;
import com.be.service.MatchingRequestLimiter;
import com.be.util.DateTimeUtils;

import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.text.Normalizer;

@Service
@RequiredArgsConstructor
public class AiMatchingServiceImpl implements AiMatchingService {
    private final MatchingAiClient ai;
    private final MatchingCandidateService candidates;
    private final AiMatchResultStore store;
    private final MatchingRequestLimiter limiter;
    private final MatchingProperties properties;
    private final Validator validator;

    @Override
    public AiMatchResponse match(AiMatchRequest request, User user) {
        if (user == null || user.getRole() != UserRole.USER || user.getStatus() != UserStatus.ACTIVE)
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        if (!validator.validate(request).isEmpty()) throw new AppException(ErrorCode.VALIDATION_ERROR);
        limiter.acquire(user.getUserId());
        AiMatchRequest criteria = request.getMessage() != null && !request.getMessage().isBlank()
                ? ai.extract(request.getMessage(), request.getLocale()) : new AiMatchRequest();
        merge(request, criteria);
        if (criteria.getTags() == null) criteria.setTags(new LinkedHashSet<>());
        if (criteria.getChildCount() == null) criteria.setChildCount(0);
        if (criteria.getRequireAllTags() == null) criteria.setRequireAllTags(false);
        if (criteria.getRequiredLanguage() != null) criteria.setRequiredLanguage(criteria.getRequiredLanguage().toUpperCase(Locale.ROOT));
        if (criteria.getRegion() != null) criteria.setRegion(criteria.getRegion().strip());
        if (criteria.getCouponCode() != null) criteria.setCouponCode(criteria.getCouponCode().isBlank() ? null : criteria.getCouponCode().strip());
        if (!validator.validate(criteria).isEmpty()) throw new AppException(ErrorCode.VALIDATION_ERROR);
        List<String> missing = new ArrayList<>();
        if (criteria.getDate() == null) missing.add("date");
        if (criteria.getAdultCount() == null) missing.add("adultCount");
        if (criteria.getTags().isEmpty()) missing.add("tags");
        String engine = ai.configured() ? "GEMINI" : "TAG_MATCHING";
        if (!missing.isEmpty()) {
            List<Reason> reasons = missing.stream().map(field -> new Reason("MISSING_REQUIRED_FIELD", field,
                    missingMessage(field, criteria.getLocale()), Map.<String, Object>of())).toList();
            return new AiMatchResponse("NEEDS_DETAILS", engine, criteria, missing, List.of(),
                    text(criteria, "Vui lòng bổ sung thông tin để tìm tour.", "Please provide more details to find a tour."), reasons);
        }
        if (criteria.getDate().isBefore(DateTimeUtils.nowVietnam().toLocalDate())
                || (criteria.getEarliestStartTime() != null && criteria.getLatestEndTime() != null
                && !criteria.getEarliestStartTime().isBefore(criteria.getLatestEndTime()))) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Invalid date or time range");
        }
        var search = candidates.search(criteria, user.getUserId());
        var options = search.candidates();
        if (options.isEmpty()) {
            if (!search.reasons().isEmpty()) {
                String summary = search.reasons().size() == 1 ? search.reasons().get(0).message()
                        : text(criteria, "Không có lựa chọn đáp ứng đồng thời các điều kiện đã chọn.",
                                "No option meets all the selected conditions together.");
                return new AiMatchResponse("NO_MATCHES", engine, criteria, List.of(), List.of(), summary, search.reasons());
            }
            return noMatches(engine, criteria, false);
        }
        if (!ai.configured() && !criteria.getRequiredExperiences().isEmpty()) {
            throw new AppException(ErrorCode.AI_NOT_CONFIGURED);
        }
        int guests = criteria.getAdultCount() + criteria.getChildCount();
        List<RankedChoice> ranked = ai.configured()
                ? ai.rank(criteria, options.stream().map(Candidate::context).toList(), Math.min(properties.getMaxResults(), options.size()))
                : options.stream().limit(properties.getMaxResults()).map(c -> new RankedChoice(
                        c.departure().getDepartureId(), c.buddies().stream().limit(guests).map(BuddyResponse::getBuddyId).toList())).toList();
        if (ranked == null || ranked.size() > Math.min(properties.getMaxResults(), options.size()))
            throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
        if (ranked.isEmpty()) return noMatches(engine, criteria, true);
        Map<UUID, Candidate> byDeparture = new HashMap<>();
        options.forEach(c -> byDeparture.put(c.departure().getDepartureId(), c));
        Set<UUID> seen = new HashSet<>();
        List<RankedChoice> supported = new ArrayList<>();
        List<List<BuddyResponse>> selectedTeams = new ArrayList<>();
        // Validate the entire model response before persisting any proposals.
        for (var choice : ranked) {
            var candidate = byDeparture.get(choice.departureId());
            if (candidate == null || !seen.add(choice.departureId()) || choice.buddyIds() == null
                    || choice.buddyIds().size() != guests || new HashSet<>(choice.buddyIds()).size() != guests)
                throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
            Map<UUID, BuddyResponse> eligible = new HashMap<>();
            candidate.buddies().forEach(b -> eligible.put(b.getBuddyId(), b));
            if (!eligible.keySet().containsAll(choice.buddyIds())) throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
            if (!hasExperienceEvidence(criteria, candidate, choice)) continue;
            supported.add(choice);
            selectedTeams.add(choice.buddyIds().stream().map(eligible::get).toList());
        }
        if (supported.isEmpty()) return noMatches(engine, criteria, true);
        List<AiMatchResponse.Choice> result = new ArrayList<>();
        for (int i = 0; i < supported.size(); i++) {
            result.add(store.save(user.getUserId(), criteria, byDeparture.get(supported.get(i).departureId()), selectedTeams.get(i), engine));
        }
        return new AiMatchResponse("MATCHED", engine, criteria, List.of(), result,
                text(criteria, "Đã tìm thấy tour và Buddy phù hợp.", "Matching tours and Buddies were found."), List.of());
    }

    private void merge(AiMatchRequest explicit, AiMatchRequest parsed) {
        Set<MatchingTag> tags = new LinkedHashSet<>();
        if (parsed.getTags() != null) tags.addAll(parsed.getTags());
        if (explicit.getTags() != null) tags.addAll(explicit.getTags());
        parsed.setTags(tags);
        if (parsed.getRequiredExperiences() == null) throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
        List<RequiredExperience> experiences = new ArrayList<>(parsed.getRequiredExperiences());
        experiences.addAll(explicit.getRequiredExperiences());
        Map<String, RequiredExperience> uniqueExperiences = new LinkedHashMap<>();
        for (RequiredExperience experience : experiences) {
            if (experience == null || experience.description() == null || experience.evidencePhrases() == null) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            RequiredExperience normalized = new RequiredExperience(experience.description().strip(),
                    experience.evidencePhrases().stream().map(phrase -> phrase == null ? null : phrase.strip()).distinct().toList());
            uniqueExperiences.putIfAbsent(normalized.description(), normalized);
        }
        parsed.setRequiredExperiences(new ArrayList<>(uniqueExperiences.values()));
        if (explicit.getDate() != null) parsed.setDate(explicit.getDate());
        if (explicit.getEarliestStartTime() != null) parsed.setEarliestStartTime(explicit.getEarliestStartTime());
        if (explicit.getLatestEndTime() != null) parsed.setLatestEndTime(explicit.getLatestEndTime());
        if (explicit.getAdultCount() != null) parsed.setAdultCount(explicit.getAdultCount());
        if (explicit.getChildCount() != null) parsed.setChildCount(explicit.getChildCount());
        if (explicit.getRegion() != null) parsed.setRegion(explicit.getRegion());
        if (explicit.getMaxTotalBudget() != null) parsed.setMaxTotalBudget(explicit.getMaxTotalBudget());
        if (explicit.getRequiredLanguage() != null) parsed.setRequiredLanguage(explicit.getRequiredLanguage());
        if (explicit.getGuidingStyle() != null) parsed.setGuidingStyle(explicit.getGuidingStyle());
        if (explicit.getRequireAllTags() != null) parsed.setRequireAllTags(explicit.getRequireAllTags());
        parsed.setCouponCode(explicit.getCouponCode()); parsed.setLocale(explicit.getLocale()); parsed.setMessage(explicit.getMessage());
    }

    private boolean hasExperienceEvidence(AiMatchRequest criteria, Candidate candidate, RankedChoice choice) {
        Map<String, RequiredExperience> required = new LinkedHashMap<>();
        criteria.getRequiredExperiences().forEach(experience -> required.put(experience.description(), experience));
        if (required.isEmpty()) return true;
        List<ExperienceEvidence> evidence = choice.experienceEvidence();
        if (evidence == null || evidence.size() != required.size()) return false;
        Map<String, String> facts = candidate.tourFacts();
        Set<String> verified = new HashSet<>();
        for (ExperienceEvidence entry : evidence) {
            if (entry == null || !required.containsKey(entry.experience()) || !verified.add(entry.experience())
                    || entry.quote() == null || entry.quote().isBlank()) return false;
            String fact = facts.get(entry.factId());
            if (fact == null || !fact.contains(entry.quote())) return false;
            String normalizedQuote = normalizeEvidence(entry.quote());
            if (required.get(entry.experience()).evidencePhrases().stream().noneMatch(phrase -> {
                String normalizedPhrase = normalizeEvidence(phrase);
                return !normalizedPhrase.isBlank() && normalizedQuote.contains(normalizedPhrase);
            })) return false;
        }
        return verified.equals(required.keySet());
    }

    private AiMatchResponse noMatches(String engine, AiMatchRequest criteria, boolean contentRejected) {
        boolean specific = contentRejected && !criteria.getRequiredExperiences().isEmpty();
        String summary = specific
                ? text(criteria, "Chưa xác minh được tour đáp ứng đồng thời các trải nghiệm bạn yêu cầu: ",
                        "No tour could be verified to offer all your required experiences: ")
                    + String.join(", ", experienceDescriptions(criteria)) + "."
                : text(criteria, "Chưa tìm thấy tour và Buddy đáp ứng các điều kiện đã chọn.",
                        "No tour and Buddy team meets the selected conditions.");
        String code = specific ? "UNVERIFIED_REQUIRED_EXPERIENCES"
                : contentRejected ? "NO_RELEVANT_TOURS" : "NO_ELIGIBLE_TOUR_AND_BUDDY";
        Reason reason = new Reason(code, specific ? "requiredExperiences" : "criteria", summary,
                Map.of("requiredExperiences", experienceDescriptions(criteria),
                        "date", criteria.getDate(), "tags", Set.copyOf(criteria.getTags())));
        return new AiMatchResponse("NO_MATCHES", engine, criteria, List.of(), List.of(), summary, List.of(reason));
    }

    private List<String> experienceDescriptions(AiMatchRequest criteria) {
        return criteria.getRequiredExperiences().stream().map(RequiredExperience::description).toList();
    }

    private String normalizeEvidence(String value) {
        return " " + Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}+", "")
                .replace('đ', 'd').replace('Đ', 'D').toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", " ").strip() + " ";
    }

    private String text(AiMatchRequest criteria, String vi, String en) {
        return "en".equals(criteria.getLocale()) ? en : vi;
    }

    private String missingMessage(String field, String locale) {
        boolean en = "en".equals(locale);
        return switch (field) {
            case "date" -> en ? "Which date would you like to go?" : "Bạn muốn đi vào ngày nào?";
            case "adultCount" -> en ? "How many adults are going?" : "Có bao nhiêu người lớn tham gia?";
            default -> en ? "Please describe your interests or choose matching tags."
                    : "Vui lòng mô tả sở thích hoặc chọn tag phù hợp.";
        };
    }
}
