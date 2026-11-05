package com.be.service;

import com.be.dto.request.AiMatchRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface MatchingAiClient {
    boolean configured();
    AiMatchRequest extract(String message, String locale);
    List<RankedChoice> rank(AiMatchRequest criteria, List<Map<String, Object>> candidates, int limit);
    enum SupportStatus { SUPPORTED, NOT_SUPPORTED, INSUFFICIENT_INFORMATION }
    record FactCitation(String factId, String quote) { }
    record ExperienceEvidence(String requirementId, SupportStatus status, List<FactCitation> citations) { }
    record RankedChoice(UUID departureId, List<UUID> buddyIds, List<ExperienceEvidence> experienceEvidence) {
        public RankedChoice(UUID departureId, List<UUID> buddyIds) {
            this(departureId, buddyIds, List.of());
        }
    }
}
