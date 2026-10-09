package com.be.service.impl;

import com.be.config.MatchingProperties;
import com.be.dto.request.AiMatchRequest;
import com.be.dto.response.*;
import com.be.entity.User;
import com.be.enums.*;
import com.be.exception.*;
import com.be.service.MatchingAiClient;
import com.be.util.DateTimeUtils;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AiMatchingService {
    private final MatchingAiClient ai;
    private final MatchingCandidateService candidates;
    private final AiMatchResultStore store;
    private final MatchingRequestLimiter limiter;
    private final MatchingProperties properties;
    private final Validator validator;

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
        if (!missing.isEmpty()) return new AiMatchResponse("NEEDS_DETAILS", engine, criteria, missing, List.of());
        if (criteria.getDate().isBefore(DateTimeUtils.nowVietnam().toLocalDate())
                || (criteria.getEarliestStartTime() != null && criteria.getLatestEndTime() != null
                && !criteria.getEarliestStartTime().isBefore(criteria.getLatestEndTime()))) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Invalid date or time range");
        }
        var options = candidates.find(criteria, user.getUserId());
        if (options.isEmpty()) return new AiMatchResponse("NO_MATCHES", engine, criteria, List.of(), List.of());
        int guests = criteria.getAdultCount() + criteria.getChildCount();
        List<MatchingAiClient.RankedChoice> ranked = ai.configured()
                ? ai.rank(criteria, options.stream().map(MatchingCandidateService.Candidate::context).toList(), Math.min(properties.getMaxResults(), options.size()))
                : options.stream().limit(properties.getMaxResults()).map(c -> new MatchingAiClient.RankedChoice(
                        c.departure().getDepartureId(), c.buddies().stream().limit(guests).map(BuddyResponse::getBuddyId).toList())).toList();
        if (ranked == null || ranked.isEmpty() || ranked.size() > properties.getMaxResults())
            throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
        Map<UUID, MatchingCandidateService.Candidate> byDeparture = new HashMap<>();
        options.forEach(c -> byDeparture.put(c.departure().getDepartureId(), c));
        Set<UUID> seen = new HashSet<>();
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
            selectedTeams.add(choice.buddyIds().stream().map(eligible::get).toList());
        }
        List<AiMatchResponse.Choice> result = new ArrayList<>();
        for (int i = 0; i < ranked.size(); i++) {
            result.add(store.save(user.getUserId(), criteria, byDeparture.get(ranked.get(i).departureId()), selectedTeams.get(i), engine));
        }
        return new AiMatchResponse("MATCHED", engine, criteria, List.of(), result);
    }

    private void merge(AiMatchRequest explicit, AiMatchRequest parsed) {
        if (explicit.getTags() != null) parsed.setTags(explicit.getTags());
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
}
