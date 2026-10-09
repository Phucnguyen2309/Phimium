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
        if (registration.getMatchResult() != null) {
            List<Buddy> held = validateMatchedBuddies(registration.getMatchResult(), departure, registration.getRegistrationId());
            java.util.Set<UUID> expected = held.stream().map(Buddy::getBuddyId).collect(Collectors.toSet());
            java.util.Set<UUID> actual = registration.getBuddies().stream().map(Buddy::getBuddyId).collect(Collectors.toSet());
            if (!expected.equals(actual)) throw new com.be.exception.AppException(com.be.exception.ErrorCode.MATCH_RESULT_CHANGED);
            registration.assignBuddies(held);
            registration.setBuddyAssignedAt(DateTimeUtils.nowVietnam());
            registration.setStatus(RegistrationStatus.BUDDY_ASSIGNED);
            registrationRepository.save(registration);
            return held.get(0);
        }

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

        return hasScheduleConflictExcluding(buddyId, newStart, newEnd, null);
    }

    private boolean hasScheduleConflictExcluding(UUID buddyId, LocalDateTime newStart, LocalDateTime newEnd, UUID excludingId) {
        List<Registration> activeRegistrations =
                registrationRepository
                        .findByBuddy_BuddyIdAndStatusIn(
                                buddyId,
                                List.of(
                                        RegistrationStatus.BUDDY_ASSIGNED,
                                        RegistrationStatus.CONFIRMED,
                                        RegistrationStatus.IN_PROGRESS,
                                        RegistrationStatus.PAYMENT_REVIEW,
                                        RegistrationStatus.PENDING_PAYMENT
                                )
                        );

        return activeRegistrations.stream()
                .filter(r -> excludingId == null || !excludingId.equals(r.getRegistrationId()))
                .filter(r -> r.getStatus() != RegistrationStatus.PENDING_PAYMENT
                        || (r.getPaymentExpiresAt() != null && r.getPaymentExpiresAt().isAfter(DateTimeUtils.nowVietnam())))
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

    @Override
    // Expected validation failures are caught by payment fulfillment checks, which must still
    // commit their release/review decision. The caller controls rollback when booking fails.
    @Transactional(dontRollbackOn = com.be.exception.AppException.class)
    public List<Buddy> validateMatchedBuddies(com.be.entity.AiMatchResult result,
            ActivityDeparture departure, UUID excludingRegistrationId) {
        if (!result.getDeparture().getDepartureId().equals(departure.getDepartureId())
                || !result.getDepartureDate().equals(departure.getDepartureDate())
                || !result.getStartTime().equals(departure.getStartTime()) || !result.getEndTime().equals(departure.getEndTime())
                || result.getBuddyIds().size() != result.getAdultCount() + result.getChildCount()
                || new java.util.HashSet<>(result.getBuddyIds()).size() != result.getBuddyIds().size()
                || !MatchingRules.tagsMatch(result.getRequestedTags(), departure.getActivity().getTags(), result.isRequireAllTags())) {
            throw new com.be.exception.AppException(com.be.exception.ErrorCode.MATCH_RESULT_CHANGED);
        }
        java.util.Map<UUID, Buddy> active = buddyRepository.findActiveWithLock(BuddyStatus.ACTIVE).stream()
                .collect(Collectors.toMap(Buddy::getBuddyId, b -> b));
        List<Buddy> selected = new java.util.ArrayList<>();
        for (UUID id : result.getBuddyIds()) {
            Buddy buddy = active.get(id);
            if (buddy == null || !MatchingRules.buddyMatches(buddy, result.getRequestedTags(), result.isRequireAllTags(),
                    result.getRequiredLanguage(), result.getGuidingStyle())) {
                throw new com.be.exception.AppException(com.be.exception.ErrorCode.MATCH_RESULT_CHANGED);
            }
            if (hasScheduleConflictExcluding(id, departure.getStartDateTime(), departure.getEndDateTime(), excludingRegistrationId)) {
                throw new com.be.exception.AppException(com.be.exception.ErrorCode.BUDDY_SCHEDULE_CONFLICT);
            }
            selected.add(buddy);
        }
        if (!MatchingFingerprint.of(departure.getActivity(), selected).equals(result.getMetadataFingerprint()))
            throw new com.be.exception.AppException(com.be.exception.ErrorCode.MATCH_RESULT_CHANGED);
        return selected;
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
