package com.be.service.impl;

import com.be.entity.ActivityDeparture;
import com.be.entity.Buddy;
import com.be.entity.Registration;
import com.be.enums.BuddyStatus;
import com.be.enums.RegistrationStatus;
import com.be.repository.BuddyRepository;
import com.be.repository.RegistrationRepository;
import com.be.service.BuddyMatchingService;
import com.be.util.DateTimeUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuddyMatchingServiceImpl implements BuddyMatchingService {

    private final BuddyRepository buddyRepository;
    private final RegistrationRepository registrationRepository;

    @Override
    @Transactional
    public Buddy findAndAssignBuddy(Registration registration) {
        ActivityDeparture departure = registration.getDeparture();

        LocalDateTime departureStart =
                departure.getStartDateTime();

        LocalDateTime departureEnd =
                departure.getEndDateTime();

        int requiredBuddies = (registration.getAdultCount() != null ? registration.getAdultCount() : 0)
                + (registration.getChildCount() != null ? registration.getChildCount() : 0);
        if (requiredBuddies <= 0) {
            requiredBuddies = 1;
        }

        // 1. Lọc điều kiện cứng: Buddy ACTIVE
        List<Buddy> activeBuddies = buddyRepository.findActiveWithLock(BuddyStatus.ACTIVE);

        // 2. Lọc điều kiện cứng: Không trùng lịch tour
        List<Buddy> eligibleBuddies = activeBuddies.stream()
                .filter(buddy -> !hasScheduleConflict(buddy.getBuddyId(), departureStart, departureEnd))
                .collect(Collectors.toList());

        if (eligibleBuddies.size() < requiredBuddies) {
            return null;
        }

        // 3. Xếp hạng đa tiêu chí (Rating -> Total Reviews)
        Comparator<Buddy> multiTierComparator = Comparator
                // Tiêu chí 1: Rating cao nhất
                .comparing((Buddy b) -> b.getAverageRating() != null ? b.getAverageRating() : BigDecimal.ZERO)
                // Tiêu chí 2: Số lượt review nhiều hơn khi bằng rating
                .thenComparing(b -> b.getTotalReviews() != null ? b.getTotalReviews() : 0);

        eligibleBuddies.sort(multiTierComparator.reversed());

        // Lấy top N Buddy có rating & review cao nhất để phục vụ N khách
        List<Buddy> selectedBuddies = eligibleBuddies.subList(0, requiredBuddies);

        // 4. Gán danh sách Buddy vào đơn đăng ký (selectedBuddies.get(0) là Lead Buddy)
        registration.assignBuddies(selectedBuddies);
        registration.setBuddyAssignedAt(DateTimeUtils.nowVietnam());
        registration.setStatus(RegistrationStatus.BUDDY_ASSIGNED);

        registrationRepository.save(registration);
        return selectedBuddies.get(0);
    }

    @Override
    public boolean hasScheduleConflict(
            UUID buddyId,
            LocalDateTime newStart,
            LocalDateTime newEnd
    ) {

        List<Registration> activeRegistrations =
                registrationRepository
                        .findByBuddy_BuddyIdAndStatusIn(
                                buddyId,
                                List.of(
                                        RegistrationStatus.BUDDY_ASSIGNED,
                                        RegistrationStatus.CONFIRMED,
                                        RegistrationStatus.IN_PROGRESS,
                                        RegistrationStatus.PAYMENT_REVIEW
                                )
                        );

        return activeRegistrations.stream()
                .map(Registration::getDeparture)
                .anyMatch(departure ->
                        isTimeOverlap(
                                departure.getStartDateTime(),
                                departure.getEndDateTime(),
                                newStart,
                                newEnd
                        )
                );
    }

    private boolean isTimeOverlap(
            LocalDateTime existingStart,
            LocalDateTime existingEnd,
            LocalDateTime newStart,
            LocalDateTime newEnd
    ) {
        return existingStart.isBefore(newEnd)
                && existingEnd.isAfter(newStart);
    }
}