package com.be.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GlobalGuidelineResponse {
    private String instructions;
    private String safetyGuidelines;
}