package com.be.mapper;

import com.be.dto.response.InstructionAcknowledgementResponse;
import com.be.entity.Activity;
import com.be.entity.InstructionAcknowledgement;
import com.be.entity.Registration;
import com.be.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InstructionAcknowledgementMapper {
    public InstructionAcknowledgement toEntity(Registration registration, User user, Activity activity, Boolean isAcknowledged) {
        if (registration == null || user == null || activity == null) {
            return null;
        }

        return InstructionAcknowledgement.builder()
                .registration(registration)
                .user(user)
                .activity(activity)
                .acknowledged(isAcknowledged != null ? isAcknowledged : false)
                .build();
    }

    // ================= ENTITY -> DTO =================

    public InstructionAcknowledgementResponse toResponse(InstructionAcknowledgement acknowledgement) {
        if (acknowledgement == null) {
            return null;
        }

        return InstructionAcknowledgementResponse.builder()
                .id(acknowledgement.getId())
                .registrationId(acknowledgement.getRegistration() == null ? null : acknowledgement.getRegistration().getRegistration_id())
                .userId(acknowledgement.getUser() == null ? null : acknowledgement.getUser().getUserId())
                .activityId(acknowledgement.getActivity() == null ? null : acknowledgement.getActivity().getId())
                .acknowledged(acknowledgement.getAcknowledged())
                .acknowledgedAt(acknowledgement.getAcknowledgedAt())
                .build();
    }

    public List<InstructionAcknowledgementResponse> toResponseList(List<InstructionAcknowledgement> acknowledgements) {
        return acknowledgements.stream().map(this::toResponse).toList();
    }
}