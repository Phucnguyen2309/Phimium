package com.be.dto.response;

import com.be.enums.GroupStatus;
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
public class ActivityGroupResponse {
    private UUID groupId;
    private String groupName;
    private GroupStatus status;
    private Integer maximumParticipants;
    private UUID activityId;
    private LocalDateTime createdAt;
}
