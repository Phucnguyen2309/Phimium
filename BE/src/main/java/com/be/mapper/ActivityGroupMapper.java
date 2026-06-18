package com.be.mapper;

import com.be.dto.response.ActivityGroupResponse;
import com.be.entity.ActivityGroup;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ActivityGroupMapper {

    public ActivityGroupResponse toResponse(ActivityGroup group) {
        if (group == null) {
            return null;
        }

        return ActivityGroupResponse.builder()
                .groupId(group.getGroupId())
                .groupName(group.getGroup_name())
                .status(group.getStatus())
                .maximumParticipants(group.getMaximumParticipants())
                .activityId(group.getActivity() == null ? null : group.getActivity().getId())
                .createdAt(group.getCreated_at())
                .build();
    }

    public List<ActivityGroupResponse> toResponseList(List<ActivityGroup> groups) {
        return groups.stream().map(this::toResponse).toList();
    }
}
