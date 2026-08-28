package com.be.dto.response;

import com.be.enums.ActivityStatus;
import com.be.enums.TourType;
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
public class ActivityResponse {
    private UUID id;
    private String title;
    private String description;
    private TourType activityType;
    private String thumbnailUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;
    private String locationName;
    private String address;
    private BigDecimal participationFee;
    private Integer minimumParticipants;
    private Integer maximumParticipants;
    private Integer groupMinSize;
    private Integer groupMaxSize;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private ActivityStatus status;
    private UUID hostBuddyId;
    private String hostBuddyName;
    private UUID createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
