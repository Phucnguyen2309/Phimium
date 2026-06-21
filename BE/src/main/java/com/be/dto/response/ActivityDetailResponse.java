package com.be.dto.response;

import com.be.enums.ActivityStatus;
import com.be.enums.ActivityType;
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
public class ActivityDetailResponse {
    private String title;
    private String description;
    private String thumbnailUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String locationName;
    private String address;
    private BigDecimal participationFee;
    private Integer maximumParticipants;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private UUID hostBuddyId;
    private String hostBuddyName;
    private String introduction;
    private int averageRating;


}
