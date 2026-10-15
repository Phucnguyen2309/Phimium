package com.be.service.impl;

import com.be.entity.Activity;
import com.be.entity.ActivityDeparture;
import com.be.entity.ActivityGroup;
import com.be.entity.Buddy;
import com.be.entity.Payment;
import com.be.entity.Registration;
import com.be.enums.ActivityStatus;
import com.be.enums.DepartureStatus;
import com.be.enums.GroupStatus;
import com.be.enums.PaymentStatus;
import com.be.enums.RegistrationStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.repository.ActivityDepartureRepository;
import com.be.repository.ActivityGroupRepository;
import com.be.repository.CouponRepository;
import com.be.repository.PaymentRepository;
import com.be.repository.RegistrationRepository;
import com.be.service.BookingLifecycleService;
import com.be.service.BookingEmailService;
import com.be.service.BuddyMatchingService;
import com.be.util.DateTimeUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingLifecycleServiceImpl implements BookingLifecycleService {
    private final RegistrationRepository registrations;
    private final ActivityDepartureRepository departures;
    private final CouponRepository coupons;
    private final PaymentRepository payments;
    private final ActivityGroupRepository groups;
    private final BuddyMatchingService matching;
    private final BookingEmailService bookingEmails;

    @Override
    public boolean isExpired(Registration registration) {
        return registration.getPaymentExpiresAt() == null
                || !DateTimeUtils.nowVietnam().isBefore(registration.getPaymentExpiresAt());
    }

    @Override
    public boolean canFulfill(Registration registration) {
        ActivityDeparture departure = departures.findByIdWithLock(registration.getDeparture().getDepartureId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));
        if (registration.getMatchResult() != null) {
            try {
                var selected = matching.validateMatchedBuddies(registration.getMatchResult(), departure, registration.getRegistrationId());
                var held = registration.getBuddies().stream().map(Buddy::getBuddyId).collect(Collectors.toSet());
                if (!held.equals(selected.stream().map(Buddy::getBuddyId).collect(Collectors.toSet()))) return false;
            } catch (AppException e) {
                if (e.getErrorCode() == ErrorCode.MATCH_RESULT_CHANGED || e.getErrorCode() == ErrorCode.BUDDY_SCHEDULE_CONFLICT) return false;
                throw e;
            }
        }
        return (departure.getStatus() == DepartureStatus.AVAILABLE || departure.getStatus() == DepartureStatus.FULL)
                && departure.getActivity().getStatus() != ActivityStatus.CANCELLED
                && departure.getActivity().getStatus() != ActivityStatus.COMPLETED
                && DateTimeUtils.nowVietnam().isBefore(departure.getStartDateTime());
    }

    @Override
    @Transactional
    public void expire(UUID registrationId) {
        Registration registration = registrations.findByIdWithLock(registrationId).orElse(null);
        if (registration != null && registration.getStatus() == RegistrationStatus.PENDING_PAYMENT
                && isExpired(registration)) release(registration);
    }

    @Override
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
        registration.clearBuddies();
        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(DateTimeUtils.nowVietnam());
        for (Payment payment : payments.findByRegistrationRegistrationId(registration.getRegistrationId())) {
            if (payment.getStatus() == PaymentStatus.PENDING) payment.setStatus(PaymentStatus.EXPIRED);
        }
    }

    @Override
    public void confirm(Registration registration) {
        if (registration.getPaymentConfirmedAt() != null) return;
        if (registration.getStatus() != RegistrationStatus.PENDING_PAYMENT || isExpired(registration)
                || !canFulfill(registration)) throw new AppException(ErrorCode.PAYMENT_REVIEW_REQUIRED);
        ActivityDeparture departure = departures.findByIdWithLock(registration.getDeparture().getDepartureId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));
        Activity activity = departure.getActivity();
        int guests = registration.getAdultCount() + registration.getChildCount();
        int max = activity.getGroupMaxSize() == null ? 6 : activity.getGroupMaxSize();
        ActivityGroup assigned = null;
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
        bookingEmails.queueConfirmation(registration);
    }
}
