package com.be.mapper;

import com.be.dto.response.ActivityDetailResponse;
import com.be.entity.Activity;
import org.springframework.stereotype.Component;
import java.util.List;

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
                .imageUrls(activity.getImageUrls() == null ? List.of() : List.copyOf(activity.getImageUrls()))
                .locationName(activity.getLocationName())
                .address(activity.getAddress())
                .participationFee(activity.getParticipationFee())
                .maximumParticipants(activity.getMaximumParticipants())
                .latitude(activity.getLatitude())
                .longitude(activity.getLongitude())
                .build();
    }
}
