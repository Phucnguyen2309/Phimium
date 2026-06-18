package com.be.mapper;

import com.be.dto.response.CheckInResponse;
import com.be.entity.CheckIn;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CheckInMapper {

    public CheckInResponse toResponse(CheckIn checkIn) {
        if (checkIn == null) {
            return null;
        }

        return CheckInResponse.builder()
                .id(checkIn.getId())
                .registrationId(checkIn.getRegistration() == null ? null : checkIn.getRegistration().getRegistration_id())
                .userId(checkIn.getUser() == null ? null : checkIn.getUser().getUserId())
                .activityId(checkIn.getActivity() == null ? null : checkIn.getActivity().getId())
                .checkedInAt(checkIn.getCheckedInAt())
                .latitude(checkIn.getLatitude())
                .longitude(checkIn.getLongitude())
                .note(checkIn.getNote())
                .build();
    }

    public List<CheckInResponse> toResponseList(List<CheckIn> checkIns) {
        return checkIns.stream().map(this::toResponse).toList();
    }
}
