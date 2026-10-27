package com.be.service;

import com.be.dto.request.AiMatchRequest;
import com.be.dto.response.ActivityDepartureResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.BuddyResponse;
import com.be.dto.response.ItineraryStopResponse;
import com.be.dto.response.AiMatchResponse.Reason;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public interface MatchingCandidateService {
    List<Candidate> find(AiMatchRequest criteria, UUID userId);

    default SearchResult search(AiMatchRequest criteria, UUID userId) {
        return new SearchResult(find(criteria, userId), List.of());
    }

    record SearchResult(List<Candidate> candidates, List<Reason> reasons) {
        public SearchResult {
            candidates = List.copyOf(candidates);
            reasons = List.copyOf(reasons);
        }
    }

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
            context.put("tourFacts", tourFacts());
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

        public Map<String, String> tourFacts() {
            Map<String, String> facts = new LinkedHashMap<>();
            addFact(facts, "title", activity.getTitle());
            addFact(facts, "description", activity.getDescription());
            if (itinerary != null) {
                for (int i = 0; i < itinerary.size(); i++) {
                    ItineraryStopResponse stop = itinerary.get(i);
                    addFact(facts, "stop:" + i + ":title", stop.getTitle());
                    addFact(facts, "stop:" + i + ":description", stop.getDescription());
                }
            }
            return facts;
        }

        private static void addFact(Map<String, String> facts, String id, String text) {
            if (text != null && !text.isBlank()) facts.put(id, text);
        }
    }
}
