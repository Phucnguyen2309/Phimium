package com.be.dto.response;

import com.be.enums.ScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuddyScheduleResponse {
    private UUID departureId;
    private UUID activityId;
    private String activityTitle;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalGuests;
    private Integer checkedInCount;
    private ScheduleStatus status;
}