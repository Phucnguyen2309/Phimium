package com.be.service;

import com.be.dto.request.AiMatchRequest;
import com.be.dto.response.ActivityDepartureResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.BuddyResponse;
import com.be.dto.response.ItineraryStopResponse;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public interface MatchingCandidateService {
    List<Candidate> find(AiMatchRequest criteria, UUID userId);

    record Candidate(ActivityResponse activity, ActivityDepartureResponse departure,
                     BigDecimal totalAmount, List<BuddyResponse> buddies,
                     List<ItineraryStopResponse> itinerary, int score) {
        public Map<String, Object> context() {
            Map<String, Object> context = new LinkedHashMap<>();
            context.put("departureId", departure.getDepartureId()); context.put("date", departure.getDepartureDate());
            context.put("startTime", departure.getStartTime()); context.put("endTime", departure.getEndTime());
            context.put("title", activity.getTitle()); context.put("description", Objects.toString(activity.getDescription(), ""));
            context.put("tags", activity.getTags()); context.put("location", activity.getLocationName());
            context.put("itinerary", itinerary); context.put("totalAmountVnd", totalAmount);
            context.put("buddies", buddies.stream().map(b -> {
                        Map<String, Object> data = new LinkedHashMap<>();
                        data.put("buddyId", b.getBuddyId());
                        data.put("interests", b.getInterests()); data.put("skills", b.getSkills());
                        data.put("languages", b.getLanguages()); data.put("guidingStyle", b.getGuidingStyle());
                        data.put("experience", b.getExperience()); data.put("introduction", b.getIntroduction());
                        data.put("bio", b.getBio()); data.put("averageRating", b.getAverageRating());
                        data.put("totalReviews", b.getTotalReviews());
                        return data;
                    }).toList());
            return context;
        }
    }
}
