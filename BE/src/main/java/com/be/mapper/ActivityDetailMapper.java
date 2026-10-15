package com.be.mapper;

import com.be.dto.response.ActivityDetailResponse;
import com.be.entity.Activity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ActivityDetailMapper {
    private final ItineraryStopMapper itineraryStopMapper;

    public ActivityDetailResponse toResponse(Activity activity) {
        if (activity == null) {
            return null;
        }

        return ActivityDetailResponse.builder()
                .title(activity.getTitle())
                .description(activity.getDescription())
                .descriptionEn(activity.getDescriptionEn())
                .tags(new LinkedHashSet<>(activity.getTags()))
                .itineraryStops(itineraryStopMapper.toResponseList(activity.getItineraryStops()))
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
