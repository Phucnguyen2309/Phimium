package com.be.mapper;

import com.be.dto.response.BuddyScheduleResponse;
import com.be.dto.response.TourMemberResponse;
import com.be.entity.ActivityDeparture;
import com.be.entity.Registration;
import com.be.enums.ScheduleStatus;
import org.springframework.stereotype.Component;

@Component
public class BuddyScheduleMapper {

    public BuddyScheduleResponse toBuddyScheduleResponse(
            ActivityDeparture departure,
            int totalGuests,
            int checkedInCount,
            ScheduleStatus status
    ) {
        if (departure == null) {
            return null;
        }

        return BuddyScheduleResponse.builder()
                .departureId(departure.getDepartureId())
                .activityId(departure.getActivity() != null ? departure.getActivity().getId() : null)
                .activityTitle(departure.getActivity() != null ? departure.getActivity().getTitle() : null)
                .location(departure.getActivity() != null ? departure.getActivity().getLocationName() : null)
                .startTime(departure.getStartTime())
                .endTime(departure.getEndTime())
                .totalGuests(totalGuests)
                .checkedInCount(checkedInCount)
                .status(status)
                .build();
    }

    public TourMemberResponse toTourMemberResponse(Registration registration) {
        if (registration == null) {
            return null;
        }

        int adults = registration.getAdultCount() != null ? registration.getAdultCount() : 0;
        int children = registration.getChildCount() != null ? registration.getChildCount() : 0;

        return TourMemberResponse.builder()
                .registrationId(registration.getRegistrationId())
                .userId(registration.getUser() != null ? registration.getUser().getUserId() : null)
                .guestName(registration.getUser() != null ? registration.getUser().getFullName() : null)
                .phoneNumber(registration.getUser() != null ? registration.getUser().getPhone() : null)
                .adultCount(adults)
                .childCount(children)
                .participantCount(adults + children)
                .checkInStatus(registration.getCheckInStatus())
                .checkedInAt(registration.getCheckedInAt())
                .build();
    }
}