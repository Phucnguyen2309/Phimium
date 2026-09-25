package com.be.service;

import com.be.entity.*;
import com.be.enums.*;
import com.be.exception.*;
import com.be.repository.*;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingLifecycleService {
    private final RegistrationRepository registrations;
    private final ActivityDepartureRepository departures;
    private final CouponRepository coupons;
    private final PaymentRepository payments;
    private final ActivityGroupRepository groups;
    private final BuddyMatchingService matching;

    public boolean isExpired(Registration registration) {
        return registration.getPaymentExpiresAt() == null
                || !DateTimeUtils.nowVietnam().isBefore(registration.getPaymentExpiresAt());
    }

    public boolean canFulfill(Registration registration) {
        ActivityDeparture departure = departures.findByIdWithLock(registration.getDeparture().getDepartureId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));
        return (departure.getStatus() == DepartureStatus.AVAILABLE || departure.getStatus() == DepartureStatus.FULL)
                && departure.getActivity().getStatus() != ActivityStatus.CANCELLED
                && departure.getActivity().getStatus() != ActivityStatus.COMPLETED
                && DateTimeUtils.nowVietnam().isBefore(departure.getStartDateTime());
    }

    @Transactional
    public void expire(UUID registrationId) {
        Registration registration = registrations.findByIdWithLock(registrationId).orElse(null);
        if (registration != null && registration.getStatus() == RegistrationStatus.PENDING_PAYMENT
                && isExpired(registration)) release(registration);
    }

    // Caller holds the registration lock (or has just created it).
    public void release(Registration registration) {
        if (registration.getStatus() == RegistrationStatus.CANCELLED) return;
        ActivityDeparture departure = departures.findByIdWithLock(registration.getDeparture().getDepartureId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));
        departure.setCapacity(departure.getCapacity() + registration.getAdultCount() + registration.getChildCount());
        if (departure.getStatus() == DepartureStatus.FULL) departure.setStatus(DepartureStatus.AVAILABLE);
        if (registration.getCoupon() != null) {
            coupons.findByIdWithLock(registration.getCoupon().getCouponId()).ifPresent(coupon ->
                    coupon.setUsedCount(Math.max(0, coupon.getUsedCount() - 1)));
        }
        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(DateTimeUtils.nowVietnam());
        for (Payment payment : payments.findByRegistrationRegistrationId(registration.getRegistrationId())) {
            if (payment.getStatus() == PaymentStatus.PENDING) payment.setStatus(PaymentStatus.EXPIRED);
        }
    }

    public void confirm(Registration registration) {
        ActivityDeparture departure = departures.findByIdWithLock(registration.getDeparture().getDepartureId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));
        Activity activity = departure.getActivity();
        int guests = registration.getAdultCount() + registration.getChildCount();
        int max = activity.getGroupMaxSize() == null ? 6 : activity.getGroupMaxSize();
        ActivityGroup assigned = null;
        // The departure lock serializes group allocation for this departure.
        for (ActivityGroup group : groups.findByActivity(activity)) {
            var members = registrations.findByGroup(group).stream()
                    .filter(r -> r.getStatus() != RegistrationStatus.CANCELLED).toList();
            if (!members.isEmpty() && members.stream().allMatch(r ->
                    r.getDeparture().getDepartureId().equals(departure.getDepartureId()))
                    && members.stream().mapToInt(r -> r.getAdultCount() + r.getChildCount()).sum()
                    + guests <= group.getMaximumParticipants()) {
                assigned = group;
                break;
            }
        }
        if (assigned == null) {
            assigned = groups.save(ActivityGroup.builder().activity(activity)
                    .groupName("Tour " + departure.getDepartureDate() + " " + departure.getStartTime()
                            + " - " + registration.getRegistrationId())
                    .maximumParticipants(max).status(GroupStatus.READY).build());
        }
        registration.setGroup(assigned);
        registration.setPaymentConfirmedAt(DateTimeUtils.nowVietnam());
        registration.setStatus(RegistrationStatus.WAITING_FOR_BUDDY);
        matching.findAndAssignBuddy(registration);
    }
}
