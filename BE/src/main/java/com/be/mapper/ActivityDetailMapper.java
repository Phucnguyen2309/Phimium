package com.be.mapper;

import com.be.dto.response.ActivityDetailResponse;
import com.be.dto.response.ActivityResponse;
import com.be.entity.Activity;
import org.springframework.stereotype.Component;

@Component
public class ActivityDetailMapper {
    public ActivityDetailResponse toResponse(Activity activity) {
        if (activity == null) {
            return null;
        }

        return ActivityDetailResponse.builder()
                .title(activity.getTitle())
                .description(activity.getDescription())
                .thumbnailUrl(activity.getThumbnailUrl())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .locationName(activity.getLocationName())
                .address(activity.getAddress())
                .participationFee(activity.getParticipationFee())
                .maximumParticipants(activity.getMaximumParticipants())
                .latitude(activity.getLatitude())
                .longitude(activity.getLongitude())
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
                .avatarUrl(activity.getHost().getAvatarUrl())
                .introduction(activity.getHost().getIntroduction())
                .averageRating(activity.getHost().getAverageRating())
                .build();
    }
}
