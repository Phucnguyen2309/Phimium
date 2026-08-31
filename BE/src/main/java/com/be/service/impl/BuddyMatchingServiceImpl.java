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

        // 1. Lọc điều kiện cứng: Buddy ACTIVE
        List<Buddy> activeBuddies = buddyRepository.findByStatus(BuddyStatus.ACTIVE);

        // 2. Lọc điều kiện cứng: Không trùng lịch tour
        List<Buddy> eligibleBuddies = activeBuddies.stream()
                .filter(buddy -> !hasScheduleConflict(buddy.getBuddyId(), departure.getStartTime(), departure.getEndTime()))
                .collect(Collectors.toList());

        if (eligibleBuddies.isEmpty()) {
            return null;
        }

        // 3. Xếp hạng đa tiêu chí (Rating -> Total Reviews -> Workload)
        Comparator<Buddy> multiTierComparator = Comparator
                // Tiêu chí 1: Rating cao nhất
                .comparing((Buddy b) -> b.getAverageRating() != null ? b.getAverageRating() : BigDecimal.ZERO)
                // Tiêu chí 2: Số lượt review nhiều hơn khi bằng rating
                .thenComparing(b -> b.getTotalReviews() != null ? b.getTotalReviews() : 0);

        Buddy bestBuddy = eligibleBuddies.stream()
                .max(multiTierComparator)
                .orElse(eligibleBuddies.get(0));

        // 4. Gán Buddy vào đơn đăng ký
        registration.setBuddy(bestBuddy);
        registration.setBuddyAssignedAt(DateTimeUtils.nowVietnam());
        registration.setStatus(RegistrationStatus.BUDDY_ASSIGNED);

        registrationRepository.save(registration);
        return bestBuddy;
    }

    @Override
    public boolean hasScheduleConflict(UUID buddyId, LocalDateTime newStart, LocalDateTime newEnd) {
        // Lấy danh sách các đơn tour đang hoạt động của Buddy
        List<Registration> activeRegistrations = registrationRepository.findByBuddy_BuddyIdAndStatusIn(
                buddyId,
                List.of(
                        RegistrationStatus.BUDDY_ASSIGNED,
                        RegistrationStatus.CONFIRMED,
                        RegistrationStatus.IN_PROGRESS
                )
        );

        // Kiểm tra overlap: existingStart < newEnd AND existingEnd > newStart
        for (Registration reg : activeRegistrations) {
            ActivityDeparture d = reg.getDeparture();
            if (d.getStartTime().isBefore(newEnd) && d.getEndTime().isAfter(newStart)) {
                return true;
            }
        }
        return false;
    }
}