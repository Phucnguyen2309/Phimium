package com.be.service;

import com.be.dto.request.InstructionRequest;
import com.be.dto.response.GlobalGuidelineResponse;

import java.util.UUID;

public interface GuidelineService {
    GlobalGuidelineResponse getGuidelineByActivity(UUID activityId);

    GlobalGuidelineResponse createInstruction(UUID activityId, InstructionRequest request);

    GlobalGuidelineResponse updateInstruction(UUID activityId, InstructionRequest request);
}
