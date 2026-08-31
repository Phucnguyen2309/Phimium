package com.be.mapper;

import com.be.dto.request.ActivityGroupRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.dto.response.ParticipantResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityGroup;
import com.be.entity.Registration;
import com.be.entity.User;
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

        if (activity != null) {
            activityId = activity.getId();
        }

        return ActivityGroupResponse.builder()
                .groupId(group.getGroupId())
                .groupName(group.getGroupName())
                .status(group.getStatus())
                .maximumParticipants(group.getMaximumParticipants())
                .currentParticipants(0)
                .activityId(activityId)
                // Đã bỏ hostId theo SRS mới
                .createdAt(group.getCreated_at())
                .participants(List.of())
                .build();
    }

    public ActivityGroupResponse toResponse(
            ActivityGroup group,
            List<Registration> registrations
    ) {
        if (group == null) {
            return null;
        }

        Activity activity = group.getActivity();
        UUID activityId = null;
        String thumbnailUrl = null;

        if (activity != null) {
            activityId = activity.getId();
            thumbnailUrl = activity.getThumbnailUrl();
        }

        List<Registration> safeRegistrations =
                registrations == null ? List.of() : registrations;

        List<ParticipantResponse> participants =
                safeRegistrations.stream()
                        .map(this::toParticipantResponse)
                        .toList();

        return ActivityGroupResponse.builder()
                .groupId(group.getGroupId())
                .groupName(group.getGroupName())
                .status(group.getStatus())
                .maximumParticipants(group.getMaximumParticipants())
                .currentParticipants(participants.size())
                .activityId(activityId)
                .thumbnailUrl(thumbnailUrl)
                .createdAt(group.getCreated_at())
                .participants(participants)
                // Đã bỏ hostId, hostName, avatarUrl theo SRS mới
                .build();
    }

    private ParticipantResponse toParticipantResponse(
            Registration registration
    ) {
        if (registration == null) {
            return null;
        }

        User user = registration.getUser();

        return ParticipantResponse.builder()
                .userId(user == null ? null : user.getUserId())
                .fullName(user == null ? null : user.getFullName())
                .avatarUrl(null)
                .build();
    }

    public ActivityGroup toEntity(
            ActivityGroupRequest group,
            Activity activity
    ) {
        if (group == null) {
            return null;
        }

        return ActivityGroup.builder()
                .groupName(group.getGroupName())
                .activity(activity)
                .status(group.getGroupStatus())
                .maximumParticipants(
                        activity.getMaximumParticipants() != null
                                ? activity.getMaximumParticipants()
                                : activity.getGroupMaxSize()
                )
                .build();
    }

    public List<ActivityGroupResponse> toResponseList(
            List<ActivityGroup> groups
    ) {
        if (groups == null) {
            return List.of();
        }

        return groups.stream()
                .map(this::toResponse)
                .toList();
    }
}