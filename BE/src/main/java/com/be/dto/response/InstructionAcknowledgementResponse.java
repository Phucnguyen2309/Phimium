package com.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructionAcknowledgementResponse {
    private UUID id;
    private UUID registrationId;
    private UUID userId;
    private UUID activityId;
    private Boolean acknowledged;
    private LocalDateTime acknowledgedAt;
}
