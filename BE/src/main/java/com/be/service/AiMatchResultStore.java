package com.be.service;

import com.be.dto.request.AiMatchRequest;
import com.be.dto.response.AiMatchResponse;
import com.be.dto.response.BuddyResponse;

import java.util.List;
import java.util.UUID;

public interface AiMatchResultStore {
    AiMatchResponse.Choice save(UUID userId, AiMatchRequest criteria,
                               MatchingCandidateService.Candidate candidate,
                               List<BuddyResponse> selected, String engine);
}
