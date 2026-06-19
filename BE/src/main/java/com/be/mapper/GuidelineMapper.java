package com.be.mapper;

import com.be.constant.GuidelineConstants;
import com.be.dto.response.GlobalGuidelineResponse;
import com.be.entity.ActivityGuideline;
import org.springframework.stereotype.Component;

@Component
public class GuidelineMapper {

    public GlobalGuidelineResponse toResponse(ActivityGuideline guideline) {
        if (guideline == null) {
            return null;
        }

        return GlobalGuidelineResponse.builder()
                .instructions(guideline.getInstructions())
                .safetyGuidelines(GuidelineConstants.HARDCODED_SAFETY_RULES)
                .build();
    }
}