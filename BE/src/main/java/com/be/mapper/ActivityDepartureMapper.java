package com.be.mapper;

import com.be.dto.request.DepartureRequest;
import com.be.dto.response.ActivityDepartureResponse;
import com.be.entity.ActivityDeparture;
import com.be.enums.DepartureStatus;
import org.springframework.stereotype.Component;

@Component
public class ActivityDepartureMapper {
    public ActivityDeparture toEntity(DepartureRequest request) {
        if (request == null) {
            return null;
        }

        return ActivityDeparture.builder()
                .departureDate(request.getDepartureDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .capacity(request.getCapacity())
                .status(DepartureStatus.AVAILABLE)
                .build();
    }

    public ActivityDepartureResponse toResponse(
            ActivityDeparture departure
    ) {
        if (departure == null) {
            return null;
        }

        return ActivityDepartureResponse.builder()
                .departureId(departure.getDepartureId())
                .activityId(
                        departure.getActivity() == null
                                ? null
                                : departure.getActivity().getId()
                )
                .departureDate(departure.getDepartureDate())
                .startTime(departure.getStartTime())
                .endTime(departure.getEndTime())
                .capacity(departure.getCapacity())
                .status(departure.getStatus())
                .build();
    }
}
