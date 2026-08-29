package com.be.mapper;

import com.be.dto.response.MyActivityResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityDeparture;
import com.be.entity.Buddy;
import com.be.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MyActivityMapper {

    public MyActivityResponse toResponse(Registration registration) {

        if (registration == null) {
            return null;
        }

        ActivityDeparture departure = registration.getDeparture();

        Activity activity =
                departure == null
                        ? null
                        : departure.getActivity();

        Buddy buddy = registration.getBuddy();

        return MyActivityResponse.builder()

                // Registration
                .registrationId(
                        registration.getRegistrationId()
                )

                // Activity
                .id(
                        activity == null
                                ? null
                                : activity.getId()
                )

                .title(
                        activity == null
                                ? null
                                : activity.getTitle()
                )

                .activityType(
                        activity == null
                                ? null
                                : activity.getActivityType()
                )

                .thumbnailUrl(
                        activity == null
                                ? null
                                : activity.getThumbnailUrl()
                )

                .locationName(
                        activity == null
                                ? null
                                : activity.getLocationName()
                )

                .address(
                        activity == null
                                ? null
                                : activity.getAddress()
                )

                .status(
                        activity == null
                                ? null
                                : activity.getStatus()
                )

                // Departure
                .startTime(
                        departure == null
                                ? null
                                : departure.getStartTime()
                )

                .endTime(
                        departure == null
                                ? null
                                : departure.getEndTime()
                )

                // Buddy assigned to THIS registration
                .hostBuddyId(
                        buddy == null
                                ? null
                                : buddy.getBuddyId()
                )

                .hostBuddyName(
                        buddy == null
                                || buddy.getUser() == null
                                ? null
                                : buddy.getUser().getFullName()
                )

                .avatarUrl(
                        buddy == null
                                ? null
                                : buddy.getAvatarUrl()
                )

                .build();
    }


    public List<MyActivityResponse> toResponseList(
            List<Registration> registrations
    ) {

        if (registrations == null) {
            return List.of();
        }

        return registrations.stream()
                .map(this::toResponse)
                .toList();
    }
}