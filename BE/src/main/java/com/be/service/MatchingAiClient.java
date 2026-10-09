package com.be.service;

import com.be.dto.request.AiMatchRequest;
import java.util.*;

public interface MatchingAiClient {
    boolean configured();
    AiMatchRequest extract(String message, String locale);
    List<RankedChoice> rank(AiMatchRequest criteria, List<Map<String, Object>> candidates, int limit);
    record RankedChoice(UUID departureId, List<UUID> buddyIds) { }
}
