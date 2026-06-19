package com.be.dto.request;

import com.be.enums.GroupStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityGroupRequest {

    @NotBlank(message = "groupName is required")
    @Size(max = 200, message = "groupName must not exceed 200 characters")
    private String groupName;

    private GroupStatus  groupStatus = GroupStatus.READY;

    private UUID activityId;

}
