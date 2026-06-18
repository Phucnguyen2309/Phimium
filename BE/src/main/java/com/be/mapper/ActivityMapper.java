package com.be.mapper;

import com.be.dto.request.ActivityRequest;
import com.be.dto.response.ActivityResponse;
import com.be.entity.Activity;
import com.be.entity.Buddy;
import com.be.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ActivityMapper {

    public Activity toEntity(ActivityRequest request, User createdBy, Buddy hostBuddy) {
        if (request == null) {
            return null;
        }

        return Activity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .activityType(request.getActivityType())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .registrationDeadline(request.getRegistrationDeadline())
                .locationName(request.getLocationName())
                .address(request.getAddress())
                .longitude(request.getLongitude())
                .latitude(request.getLatitude())
                .participationFee(request.getParticipationFee())
                .minimumParticipants(request.getMinimumParticipants())
                .maximumParticipants(request.getMaximumParticipants())
                .groupMinSize(request.getGroupMinSize())
                .groupMaxSize(request.getGroupMaxSize())
                .status(request.getStatus())
                .host(hostBuddy)
                .createdBy(createdBy)
                .build();
    }

    public ActivityResponse toResponse(Activity activity) {
        if (activity == null) {
            return null;
        }

        return ActivityResponse.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .description(activity.getDescription())
                .activityType(activity.getActivityType())
                .thumbnailUrl(activity.getThumbnailUrl())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .registrationDeadline(activity.getRegistrationDeadline())
                .locationName(activity.getLocationName())
                .address(activity.getAddress())
                .participationFee(activity.getParticipationFee())
                .minimumParticipants(activity.getMinimumParticipants())
                .maximumParticipants(activity.getMaximumParticipants())
                .groupMinSize(activity.getGroupMinSize())
                .groupMaxSize(activity.getGroupMaxSize())
                .latitude(activity.getLatitude())
                .longitude(activity.getLongitude())
                .status(activity.getStatus())
                .hostBuddyId(
                        activity.getHost() == null
                                ? null
                                : activity.getHost().getBuddyId()
                )
                .hostBuddyName(
                        activity.getHost() == null
                                || activity.getHost().getUser() == null
                                ? null
                                : activity.getHost().getUser().getFullName()
                )
                .createdById(
                        activity.getCreatedBy() == null
                                ? null
                                : activity.getCreatedBy().getUserId()
                )
                .createdAt(activity.getCreatedAt())
                .updatedAt(activity.getUpdatedAt())
                .build();
    }

    public List<ActivityResponse> toResponseList(List<Activity> activities) {
        if (activities == null) {
            return List.of();
        }

        return activities.stream()
                .map(this::toResponse)
                .toList();
    }
}
