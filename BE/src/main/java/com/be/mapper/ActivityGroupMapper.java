package com.be.mapper;

import com.be.dto.request.ActivityGroupRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityGroup;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ActivityGroupMapper {

    public ActivityGroupResponse toResponse(ActivityGroup group) {
        if (group == null) {
            return null;
        }
        Activity activity = group.getActivity();

        UUID activityId = null;
        UUID hostId = null;

        if (activity != null) {
            activityId = activity.getId();

            if (activity.getHost() != null) {
                hostId = activity.getHost().getBuddyId();
            }
        }
        return ActivityGroupResponse.builder()
                .groupId(group.getGroupId())
                .groupName(group.getGroup_name())
                .status(group.getStatus())
                .maximumParticipants(group.getMaximumParticipants())
                .activityId(activityId)
                .hostId(hostId)
                .createdAt(group.getCreated_at())
                .build();
    }

    public ActivityGroup toEntity(ActivityGroupRequest group, Activity activity ) {
        if (group == null) {
            return null;
        }

        return ActivityGroup.builder()
                .group_name(group.getGroupName())
                .activity(activity)
                .status(group.getGroupStatus())
                .maximumParticipants(activity.getMaximumParticipants())
                .build();
    }



    public List<ActivityGroupResponse> toResponseList(List<ActivityGroup> groups) {
        return groups.stream().map(this::toResponse).toList();
    }
}
