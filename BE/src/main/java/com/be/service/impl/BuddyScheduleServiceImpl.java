package com.be.service.impl;

import com.be.dto.response.BuddyScheduleResponse;
import com.be.dto.response.TourMemberResponse;
import com.be.entity.ActivityDeparture;
import com.be.entity.Buddy;
import com.be.entity.Registration;
import com.be.entity.User;
import com.be.enums.CheckInStatus;
import com.be.enums.ScheduleStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.BuddyScheduleMapper;
import com.be.repository.BuddyRepository;
import com.be.repository.RegistrationRepository;
import com.be.service.BuddyScheduleService;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuddyScheduleServiceImpl implements BuddyScheduleService {

    private final BuddyRepository buddyRepository;
    private final RegistrationRepository registrationRepository;
    private final BuddyScheduleMapper buddyScheduleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BuddyScheduleResponse> getMySchedules(User currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Buddy buddy = buddyRepository.findByUser_UserId(currentUser.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_AUTHORIZED));

        List<Registration> registrations = registrationRepository.findByBuddyId(buddy.getBuddyId());
        LocalDateTime now = DateTimeUtils.nowVietnam();

        Map<ActivityDeparture, List<Registration>> groupedByDeparture = registrations.stream()
                .collect(Collectors.groupingBy(Registration::getDeparture));

        return groupedByDeparture.entrySet().stream()
                .map(entry -> {
                    ActivityDeparture departure = entry.getKey();
                    List<Registration> regs = entry.getValue();

                    int totalGuests = regs.stream()
                            .mapToInt(r -> {
                                int adults = r.getAdultCount() != null ? r.getAdultCount() : 0;
                                int children = r.getChildCount() != null ? r.getChildCount() : 0;
                                return adults + children;
                            })
                            .sum();

                    int checkedIn = (int) regs.stream()
                            .filter(r -> r.getCheckInStatus() == CheckInStatus.PRESENT)
                            .count();

                    ScheduleStatus status;
                    if (now.isBefore(departure.getStartTime())) {
                        status = ScheduleStatus.UPCOMING;
                    } else if (now.isAfter(departure.getEndTime())) {
                        status = ScheduleStatus.COMPLETED;
                    } else {
                        status = ScheduleStatus.IN_PROGRESS;
                    }

                    return buddyScheduleMapper.toBuddyScheduleResponse(departure, totalGuests, checkedIn, status);
                })
                .sorted(Comparator.comparing(BuddyScheduleResponse::getStartTime))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourMemberResponse> getTourMembers(UUID departureId, User currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Buddy buddy = buddyRepository.findByUser_UserId(currentUser.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_AUTHORIZED));

        List<Registration> regs = registrationRepository.findByBuddyIdAndDepartureId(buddy.getBuddyId(), departureId);

        return regs.stream()
                .map(buddyScheduleMapper::toTourMemberResponse)
                .collect(Collectors.toList());
    }
}