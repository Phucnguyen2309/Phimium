package com.be.dto.response;

import com.be.enums.ActivityStatus;
import com.be.enums.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MyActivityResponse {
    private UUID id;
    private String title;
    private ActivityType activityType;
    private String thumbnailUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String locationName;
    private String address;
    private ActivityStatus status;
    private UUID registrationId;
    private UUID hostBuddyId;
    private String hostBuddyName;
    private String avatarUrl;

}
