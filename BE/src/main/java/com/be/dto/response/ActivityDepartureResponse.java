package com.be.dto.response;

import com.be.enums.DepartureStatus;
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
public class ActivityDepartureResponse {
    private UUID departureId;
    private UUID activityId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private DepartureStatus status;
}