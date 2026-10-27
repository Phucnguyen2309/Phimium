package com.be.dto.response;

import com.be.dto.request.AiMatchRequest;
import com.be.enums.MatchingTag;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public record AiMatchResponse(String status, String engine, AiMatchRequest criteria,
                              List<String> missingFields, List<Choice> choices,
                              String summary, List<Reason> reasons) {
    public record Reason(String code, String field, String message, Map<String, Object> details) { }

    public record Choice(UUID matchResultId, LocalDateTime expiresAt, ActivityResponse activity,
                         ActivityDepartureResponse departure, BigDecimal totalAmount, String currency,
                         List<BuddyResponse> buddies, UUID leadBuddyId,
                         Set<MatchingTag> matchedTags, Set<MatchingTag> missingTags,
                         List<String> reasons, List<ItineraryStopResponse> itinerary) { }
}
