package com.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInResponse {
    private UUID id;
    private UUID registrationId;
    private UUID userId;
    private UUID activityId;
    private LocalDateTime checkedInAt;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String note;
}
