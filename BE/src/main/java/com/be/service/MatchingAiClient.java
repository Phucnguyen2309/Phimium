package com.be.service;

import com.be.dto.request.AiMatchRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface MatchingAiClient {
    boolean configured();
    AiMatchRequest extract(String message, String locale);
    List<RankedChoice> rank(AiMatchRequest criteria, List<Map<String, Object>> candidates, int limit);
    record ExperienceEvidence(String experience, String factId, String quote) { }
    record RankedChoice(UUID departureId, List<UUID> buddyIds, List<ExperienceEvidence> experienceEvidence) {
        public RankedChoice(UUID departureId, List<UUID> buddyIds) {
            this(departureId, buddyIds, List.of());
        }
    }
}
