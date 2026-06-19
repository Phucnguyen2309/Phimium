package com.be.service.impl;

import com.be.constant.GuidelineConstants;
import com.be.dto.request.InstructionRequest;
import com.be.dto.response.GlobalGuidelineResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityGuideline;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.GuidelineMapper;
import com.be.repository.ActivityGuidelineRepository;
import com.be.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuidelineServiceImpl {

    private final ActivityGuidelineRepository guidelineRepository;
    private final ActivityRepository activityRepository;
    private final GuidelineMapper guidelineMapper;

    // ================== GET ==================
    public GlobalGuidelineResponse getGuidelineByActivity(UUID activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));

        ActivityGuideline guideline = guidelineRepository.findByActivity(activity)
                .orElseThrow(() -> new AppException(ErrorCode.GUIDELINE_NOT_FOUND));

        // Dùng mapper
        return guidelineMapper.toResponse(guideline);
    }

    // ================== CREATE ==================
    @Transactional
    public GlobalGuidelineResponse createInstruction(UUID activityId, InstructionRequest request) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));

        if (guidelineRepository.findByActivity(activity).isPresent()) {
            throw new AppException(ErrorCode.GUIDELINE_ALREADY_EXISTS);
        }

        ActivityGuideline newGuideline = ActivityGuideline.builder()
                .activity(activity)
                .instructions(request.getInstructions())
                .safetyGuidelines(GuidelineConstants.HARDCODED_SAFETY_RULES) // Lưu vào DB
                .build();

        newGuideline = guidelineRepository.save(newGuideline);

        // Dùng mapper
        return guidelineMapper.toResponse(newGuideline);
    }

    // ================== UPDATE ==================
    @Transactional
    public GlobalGuidelineResponse updateInstruction(UUID activityId, InstructionRequest request) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));

        ActivityGuideline existingGuideline = guidelineRepository.findByActivity(activity)
                .orElseThrow(() -> new AppException(ErrorCode.GUIDELINE_NOT_FOUND));

        existingGuideline.setInstructions(request.getInstructions());
        existingGuideline.setSafetyGuidelines(GuidelineConstants.HARDCODED_SAFETY_RULES);

        existingGuideline = guidelineRepository.save(existingGuideline);

        // Dùng mapper
        return guidelineMapper.toResponse(existingGuideline);
    }
}