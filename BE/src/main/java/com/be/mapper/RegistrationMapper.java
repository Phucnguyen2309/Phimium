package com.be.mapper;

import com.be.dto.response.RegistrationResponse;
import com.be.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RegistrationMapper {

    public RegistrationResponse toResponse(Registration registration) {
        if (registration == null) {
            return null;
        }

        return RegistrationResponse.builder()
                .registrationId(registration.getRegistrationId())
                .activityId(registration.getActivity() == null ? null : registration.getActivity().getId())
                .userId(registration.getUser() == null ? null : registration.getUser().getUserId())
                .groupId(registration.getGroup() == null ? null : registration.getGroup().getGroupId())
                .status(registration.getStatus())
                .registeredAt(registration.getRegisteredAt())
                .cancelledAt(registration.getCancelledAt())
                .checkedInAt(registration.getCheckedInAt())
                .checkInStatus(registration.getCheckInStatus())
                .build();
    }

    public List<RegistrationResponse> toResponseList(List<Registration> registrations) {
        return registrations.stream().map(this::toResponse).toList();
    }
}
