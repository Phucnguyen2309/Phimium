package com.be.mapper;

import com.be.dto.response.RegistrationResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityDeparture;
import com.be.entity.Buddy;
import com.be.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RegistrationMapper {

    public RegistrationResponse toResponse(Registration registration) {
        if (registration == null) {
            return null;
        }

        // 1. Map Activity & Departure
        RegistrationResponse.DepartureInfo departureInfo = null;
        ActivityDeparture departure = registration.getDeparture();
        if (departure != null) {
            RegistrationResponse.ActivityInfo activityInfo = null;
            Activity activity = departure.getActivity();
            if (activity != null) {
                activityInfo = RegistrationResponse.ActivityInfo.builder()
                        .activityId(activity.getId())
                        .title(activity.getTitle())
                        .build();
            }

            departureInfo = RegistrationResponse.DepartureInfo.builder()
                    .departureId(departure.getDepartureId())
                    .departureDate(departure.getDepartureDate())
                    .startTime(departure.getStartTime())
                    .endTime(departure.getEndTime())
                    .activity(activityInfo)
                    .build();
        }

        // 2. Map Buddy
        RegistrationResponse.BuddyInfo buddyInfo = null;
        List<RegistrationResponse.BuddyInfo> buddyInfoList = null;

        if (registration.getBuddies() != null && !registration.getBuddies().isEmpty()) {
            buddyInfoList = registration.getBuddies().stream()
                    .map(b -> RegistrationResponse.BuddyInfo.builder()
                            .buddyId(b.getBuddyId())
                            .name(b.getUser() != null ? b.getUser().getFullName() : null)
                            .averageRating(b.getAverageRating())
                            .build())
                    .toList();
        }

        Buddy buddy = registration.getBuddy();
        if (buddy != null) {
            String buddyName = buddy.getUser() != null ? buddy.getUser().getFullName() : null;
            if (registration.getBuddies() != null && registration.getBuddies().size() > 1) {
                buddyName = buddyName + " (+" + (registration.getBuddies().size() - 1) + " Buddies)";
            }
            buddyInfo = RegistrationResponse.BuddyInfo.builder()
                    .buddyId(buddy.getBuddyId())
                    .name(buddyName)
                    .averageRating(buddy.getAverageRating())
                    .build();
        }

        return RegistrationResponse.builder()
                .registrationId(registration.getRegistrationId())
                .matchResultId(registration.getMatchResult() == null ? null : registration.getMatchResult().getId())
                .buddyHoldExpiresAt(registration.getMatchResult() != null
                        && registration.getStatus() == com.be.enums.RegistrationStatus.PENDING_PAYMENT
                        ? registration.getPaymentExpiresAt() : null)
                .status(registration.getStatus())
                .departure(departureInfo)
                .adultCount(registration.getAdultCount())
                .childCount(registration.getChildCount())
                .pickupLocation(registration.getPickupLocation())
                .subtotal(registration.getSubtotal())
                .discountAmount(registration.getDiscountAmount())
                .totalAmount(registration.getTotalAmount())
                .buddy(buddyInfo)
                .buddies(buddyInfoList)
                .checkInStatus(registration.getCheckInStatus())
                .registeredAt(registration.getRegisteredAt())
                .paymentExpiresAt(registration.getPaymentExpiresAt())
                .paymentConfirmedAt(registration.getPaymentConfirmedAt())
                .checkedInAt(registration.getCheckedInAt())
                .cancelledAt(registration.getCancelledAt())
                .build();
    }

    public List<RegistrationResponse> toResponseList(List<Registration> registrations) {
        if (registrations == null) return List.of();
        return registrations.stream().map(this::toResponse).toList();
    }
}