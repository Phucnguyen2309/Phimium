package com.be.mapper;

import com.be.dto.request.ActivityRequest;
import com.be.dto.request.UpdateActivityRequest;
import com.be.dto.response.ActivityDepartureResponse;
import com.be.dto.response.ActivityResponse;
import com.be.entity.Activity;
import com.be.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ActivityMapper {

    public Activity toEntity(ActivityRequest request, User createdBy) {
        if (request == null) {
            return null;
        }

        return Activity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .activityType(request.getActivityType())
                .locationName(request.getLocationName())
                .address(request.getAddress())
                .longitude(request.getLongitude())
                .latitude(request.getLatitude())
                .participationFee(request.getParticipationFee())
                .childParticipationFee(request.getChildParticipationFee())
                .minimumParticipants(request.getMinimumParticipants())
                .maximumParticipants(request.getMaximumParticipants())
                .groupMinSize(request.getGroupMinSize())
                .groupMaxSize(request.getGroupMaxSize())
                .status(request.getStatus())
                .createdBy(createdBy)
                .build();
    }

    public ActivityResponse toResponse(Activity activity) {
        if (activity == null) {
            return null;
        }

        // Map danh sách Departures
        List<ActivityDepartureResponse> departureResponses = null;
        if (activity.getDepartures() != null) {
            departureResponses = activity.getDepartures().stream()
                    .map(d -> ActivityDepartureResponse.builder()
                            .departureId(d.getDepartureId())
                            .activityId(activity.getId())
                            .departureDate(d.getDepartureDate())
                            .startTime(d.getStartTime())
                            .endTime(d.getEndTime())
                            .capacity(d.getCapacity())
                            .status(d.getStatus())
                            .build())
                    .collect(Collectors.toList());
        }

        return ActivityResponse.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .tags(new java.util.LinkedHashSet<>(activity.getTags()))
                .itineraryStops(new java.util.ArrayList<>(activity.getItineraryStops()))
                .description(activity.getDescription())
                .activityType(activity.getActivityType())
                .thumbnailUrl(activity.getThumbnailUrl())
                // Đã bỏ các trường time và hostBuddy
                .locationName(activity.getLocationName())
                .address(activity.getAddress())
                .participationFee(activity.getParticipationFee())
                .childParticipationFee(activity.getChildParticipationFee())
                .minimumParticipants(activity.getMinimumParticipants())
                .maximumParticipants(activity.getMaximumParticipants())
                .groupMinSize(activity.getGroupMinSize())
                .groupMaxSize(activity.getGroupMaxSize())
                .latitude(activity.getLatitude())
                .longitude(activity.getLongitude())
                .status(activity.getStatus())
                .createdById(
                        activity.getCreatedBy() == null
                                ? null
                                : activity.getCreatedBy().getUserId()
                )
                .createdAt(activity.getCreatedAt())
                .updatedAt(activity.getUpdatedAt())
                .departures(departureResponses)
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

    public void updateEntity(UpdateActivityRequest request, Activity activity) {
        if (request == null || activity == null) {
            return;
        }

        if (request.getTitle() != null) {
            activity.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            activity.setDescription(request.getDescription());
        }
        if (request.getActivityType() != null) {
            activity.setActivityType(request.getActivityType());
        }
        if (request.getLocationName() != null) {
            activity.setLocationName(request.getLocationName());
        }
        if (request.getAddress() != null) {
            activity.setAddress(request.getAddress());
        }
        if (request.getLongitude() != null) {
            activity.setLongitude(request.getLongitude());
        }
        if (request.getLatitude() != null) {
            activity.setLatitude(request.getLatitude());
        }
        if (request.getParticipationFee() != null) {
            activity.setParticipationFee(request.getParticipationFee());
        }
        if (request.getChildParticipationFee() != null) {
            activity.setChildParticipationFee(request.getChildParticipationFee());
        }
        if (request.getMinimumParticipants() != null) {
            activity.setMinimumParticipants(request.getMinimumParticipants());
        }
        if (request.getMaximumParticipants() != null) {
            activity.setMaximumParticipants(request.getMaximumParticipants());
        }
        if (request.getGroupMinSize() != null) {
            activity.setGroupMinSize(request.getGroupMinSize());
        }
        if (request.getGroupMaxSize() != null) {
            activity.setGroupMaxSize(request.getGroupMaxSize());
        }
        if (request.getStatus() != null) {
            activity.setStatus(request.getStatus());
        }
    }
}
