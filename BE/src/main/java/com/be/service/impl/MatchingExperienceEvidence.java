package com.be.service.impl;

import com.be.dto.request.AiMatchRequest.RequiredExperience;
import com.be.service.MatchingAiClient.ExperienceEvidence;
import com.be.service.MatchingAiClient.FactCitation;
import com.be.service.MatchingAiClient.SupportStatus;
import com.be.service.MatchingCandidateService.Candidate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

/** Checks the provenance of semantic assessments; meaning is evaluated by the AI ranker. */
final class MatchingExperienceEvidence {
    private MatchingExperienceEvidence() { }

    static List<Map<String, String>> requirements(List<RequiredExperience> requirements) {
        return IntStream.range(0, requirements.size()).mapToObj(index ->
                Map.of("requirementId", requirementId(index), "description", requirements.get(index).description()))
                .toList();
    }

    static Check verify(List<RequiredExperience> requirements, Candidate candidate,
                        List<ExperienceEvidence> evidence) {
        Map<String, String> expected = new LinkedHashMap<>();
        for (int index = 0; index < requirements.size(); index++) {
            expected.put(requirementId(index), requirements.get(index).description());
        }
        Map<String, ExperienceEvidence> byRequirement = new LinkedHashMap<>();
        List<Issue> issues = new ArrayList<>();
        if (evidence == null) {
            return new Check(List.of(), List.copyOf(expected.values()), List.of(new Issue(null, "MISSING_EVIDENCE")));
        }
        for (ExperienceEvidence entry : evidence) {
            if (entry == null || !expected.containsKey(entry.requirementId())) {
                issues.add(new Issue(entry == null ? null : entry.requirementId(), "UNKNOWN_REQUIREMENT"));
            } else if (byRequirement.putIfAbsent(entry.requirementId(), entry) != null) {
                issues.add(new Issue(entry.requirementId(), "DUPLICATE_REQUIREMENT"));
            }
        }
        if (!issues.isEmpty()) return new Check(List.of(), List.copyOf(expected.values()), issues);
        List<String> verified = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        Map<String, String> facts = candidate.tourFacts();
        for (var requirement : expected.entrySet()) {
            ExperienceEvidence entry = byRequirement.get(requirement.getKey());
            String issue = issue(entry, facts);
            if (issue == null) {
                verified.add(requirement.getValue());
            } else {
                missing.add(requirement.getValue());
                issues.add(new Issue(requirement.getKey(), issue));
            }
        }
        return new Check(verified, missing, issues);
    }

    private static String issue(ExperienceEvidence entry, Map<String, String> facts) {
        if (entry == null) return "MISSING_EVIDENCE";
        if (entry.status() == SupportStatus.NOT_SUPPORTED) return "MODEL_NOT_SUPPORTED";
        if (entry.status() == SupportStatus.INSUFFICIENT_INFORMATION) return "MODEL_INSUFFICIENT_INFORMATION";
        if (entry.status() != SupportStatus.SUPPORTED) return "MISSING_ASSESSMENT";
        if (entry.citations() == null || entry.citations().isEmpty() || entry.citations().size() > 3) {
            return "INVALID_CITATIONS";
        }
        for (FactCitation citation : entry.citations()) {
            if (citation == null || citation.factId() == null || !facts.containsKey(citation.factId())) return "UNKNOWN_FACT";
            if (citation.quote() == null || citation.quote().isBlank() || citation.quote().length() > 800) return "INVALID_QUOTE";
            if (!facts.get(citation.factId()).contains(citation.quote())) return "QUOTE_NOT_IN_FACT";
        }
        return null;
    }

    private static String requirementId(int index) {
        return "experience-" + (index + 1);
    }

    record Issue(String requirementId, String code) { }

    record Check(List<String> verified, List<String> unverified, List<Issue> issues) {
        Check {
            verified = List.copyOf(verified);
            unverified = List.copyOf(unverified);
            issues = List.copyOf(issues);
        }
    }
}
