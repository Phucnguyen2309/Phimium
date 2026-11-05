package com.be.mapper;

import com.be.dto.request.ItineraryStopRequest;
import com.be.dto.response.ItineraryStopResponse;
import com.be.entity.ItineraryStop;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ItineraryStopMapper {
    public ItineraryStop toEntity(ItineraryStopRequest request) {
        return ItineraryStop.builder()
                .title(request.getTitle().trim())
                .titleEn(request.getTitleEn() == null ? null : request.getTitleEn().trim())
                .description(request.getDescription().trim())
                .descriptionEn(request.getDescriptionEn() == null ? null : request.getDescriptionEn().trim())
                .offsetMinutes(request.getOffsetMinutes())
                .durationMinutes(request.getDurationMinutes())
                .build();
    }

    public ItineraryStopResponse toResponse(ItineraryStop stop) {
        if (stop == null) {
            return null;
        }
        return ItineraryStopResponse.builder()
                .stopId(stop.getStopId())
                .activityId(stop.getActivity() == null ? null : stop.getActivity().getId())
                .stopOrder(stop.getStopOrder())
                .title(stop.getTitle())
                .titleEn(stop.getTitleEn())
                .description(stop.getDescription())
                .descriptionEn(stop.getDescriptionEn())
                .offsetMinutes(stop.getOffsetMinutes())
                .durationMinutes(stop.getDurationMinutes())
                .imageUrl(stop.getImageUrl())
                .build();
    }

    public List<ItineraryStopResponse> toResponseList(List<ItineraryStop> stops) {
        if (stops == null) {
            return List.of();
        }
        return stops.stream().map(this::toResponse).toList();
    }
}
