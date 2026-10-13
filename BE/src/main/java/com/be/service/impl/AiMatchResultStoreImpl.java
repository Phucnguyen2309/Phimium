package com.be.service.impl;

import com.be.config.MatchingProperties;
import com.be.dto.request.AiMatchRequest;
import com.be.dto.response.AiMatchResponse;
import com.be.dto.response.BuddyResponse;
import com.be.entity.AiMatchResult;
import com.be.enums.MatchingTag;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.repository.ActivityDepartureRepository;
import com.be.repository.AiMatchResultRepository;
import com.be.repository.UserRepository;
import com.be.service.AiMatchResultStore;
import com.be.service.MatchingCandidateService;
import com.be.util.DateTimeUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiMatchResultStoreImpl implements AiMatchResultStore {
    private final AiMatchResultRepository matches;
    private final ActivityDepartureRepository departures;
    private final UserRepository users;
    private final MatchingProperties properties;
    private final ObjectMapper mapper;

    @Override
    @Transactional
    public AiMatchResponse.Choice save(UUID userId, AiMatchRequest criteria, MatchingCandidateService.Candidate candidate,
                                       List<BuddyResponse> selected, String engine) {
        AiMatchResult result = new AiMatchResult();
        result.setUser(users.getReferenceById(userId));
        result.setDeparture(departures.getReferenceById(candidate.departure().getDepartureId()));
        result.setAdultCount(criteria.getAdultCount()); result.setChildCount(criteria.getChildCount());
        result.setCouponCode(criteria.getCouponCode()); result.setQuotedTotal(candidate.totalAmount());
        result.setDepartureDate(candidate.departure().getDepartureDate());
        result.setStartTime(candidate.departure().getStartTime()); result.setEndTime(candidate.departure().getEndTime());
        result.setBuddyIds(selected.stream().map(BuddyResponse::getBuddyId).toList());
        result.setRequestedTags(new LinkedHashSet<>(criteria.getTags()));
        result.setRequiredLanguage(criteria.getRequiredLanguage()); result.setGuidingStyle(criteria.getGuidingStyle());
        result.setRequireAllTags(criteria.getRequireAllTags());
        try { result.setCriteriaJson(mapper.writeValueAsString(criteria)); }
        catch (Exception e) { throw new AppException(ErrorCode.VALIDATION_ERROR); }
        result.setMetadataFingerprint(MatchingFingerprint.of(candidate.activity(), selected));
        result.setEngine(engine); result.setCreatedAt(DateTimeUtils.nowVietnam());
        result.setModelName("GEMINI".equals(engine) ? properties.getGemini().getModel() : null);
        result.setPromptVersion("smart-match-v1");
        result.setExpiresAt(result.getCreatedAt().plusMinutes(properties.getResultMinutes()));
        matches.saveAndFlush(result);
        Set<MatchingTag> shared = MatchingRules.shared(criteria.getTags(), candidate.activity().getTags());
        Set<MatchingTag> missing = new LinkedHashSet<>(criteria.getTags()); missing.removeAll(shared);
        List<String> reasons = new ArrayList<>();
        boolean en = "en".equals(criteria.getLocale());
        reasons.add((en ? "Tour interests: " : "Chủ đề tour phù hợp: ") + labels(shared, en));
        for (BuddyResponse b : selected) {
            reasons.add(Objects.toString(b.getFullName(), b.getBuddyId().toString()) + ": "
                    + labels(MatchingRules.shared(criteria.getTags(), b.getInterests()), en));
        }
        return new AiMatchResponse.Choice(result.getId(), result.getExpiresAt(), candidate.activity(), candidate.departure(),
                candidate.totalAmount(), "VND", selected, selected.get(0).getBuddyId(), shared, missing, reasons, candidate.itinerary());
    }

    private String labels(Set<MatchingTag> tags, boolean en) {
        return tags.stream().map(t -> en ? t.getLabelEn() : t.getLabelVi()).collect(Collectors.joining(", "));
    }
}
