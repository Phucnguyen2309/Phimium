package com.be.dto.response;

import com.be.enums.DepartureStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDepartureResponse {
    private UUID departureId;
    private UUID activityId;
    private LocalDate departureDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer capacity;
    private DepartureStatus status;
}