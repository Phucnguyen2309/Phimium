package com.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryStopResponse {
    private UUID stopId;
    private UUID activityId;
    private Integer stopOrder;
    private String title;
    private String description;
    private Integer offsetMinutes;
    private Integer durationMinutes;
    private String imageUrl;
}
