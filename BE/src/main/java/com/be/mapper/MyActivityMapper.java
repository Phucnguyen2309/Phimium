package com.be.mapper;


import com.be.dto.response.MyActivityResponse;
import com.be.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MyActivityMapper {
    public MyActivityResponse toResponse(Registration registration) {
        if (registration == null) {
            return null;
        }

        return MyActivityResponse.builder()
                .id(registration.getActivity().getId())
                .title(registration.getActivity().getTitle())
                .activityType(registration.getActivity().getActivityType())
                .thumbnailUrl(registration.getActivity().getThumbnailUrl())
                .startTime(registration.getActivity().getStartTime())
                .endTime(registration.getActivity().getEndTime())
                .locationName(registration.getActivity().getLocationName())
                .address(registration.getActivity().getAddress())
                .status(registration.getActivity().getStatus())
                .hostBuddyId(
                        registration.getActivity().getHost() == null
                                ? null
                                : registration.getActivity().getHost().getBuddyId()
                )
                .hostBuddyName(
                        registration.getActivity().getHost() == null
                                || registration.getActivity().getHost().getUser() == null
                                ? null
                                : registration.getActivity().getHost().getUser().getFullName()
                )
                .avatarUrl(registration.getActivity().getHost().getAvatarUrl())
                .registrationId(registration.getRegistrationId())

                .build();
    }

    public List<MyActivityResponse> toResponseList(List<Registration> registrations) {
        if (registrations == null) {
            return List.of();
        }

        return registrations.stream()
                .map(this::toResponse)
                .toList();
    }
}
