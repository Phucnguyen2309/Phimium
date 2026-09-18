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

        Buddy buddy = buddyRepository
                .findByUser_UserId(currentUser.getUserId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_AUTHORIZED)
                );

        List<Registration> registrations =
                registrationRepository.findByBuddyId(
                        buddy.getBuddyId()
                );

        LocalDateTime now = DateTimeUtils.nowVietnam();

        Map<ActivityDeparture, List<Registration>> groupedByDeparture =
                registrations.stream()
                        .collect(
                                Collectors.groupingBy(
                                        Registration::getDeparture
                                )
                        );

        return groupedByDeparture.entrySet()
                .stream()
                .map(entry ->
                        buildScheduleResponse(entry, now)
                )
                .sorted(
                        Comparator
                                .comparing(
                                        BuddyScheduleResponse::getDepartureDate
                                )
                                .thenComparing(
                                        BuddyScheduleResponse::getStartTime
                                )
                )
                .toList();
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

    private BuddyScheduleResponse buildScheduleResponse(
            Map.Entry<ActivityDeparture, List<Registration>> entry,
            LocalDateTime now
    ) {

        ActivityDeparture departure = entry.getKey();
        List<Registration> registrations = entry.getValue();

        int totalGuests =
                calculateTotalGuests(registrations);

        int checkedIn =
                countCheckedInGuests(registrations);

        ScheduleStatus status =
                determineScheduleStatus(departure, now);

        return buddyScheduleMapper.toBuddyScheduleResponse(
                departure,
                totalGuests,
                checkedIn,
                status
        );
    }

    private int calculateTotalGuests(
            List<Registration> registrations
    ) {
        return registrations.stream()
                .mapToInt(registration -> {

                    int adults =
                            registration.getAdultCount() == null
                                    ? 0
                                    : registration.getAdultCount();

                    int children =
                            registration.getChildCount() == null
                                    ? 0
                                    : registration.getChildCount();

                    return adults + children;
                })
                .sum();
    }

    private int countCheckedInGuests(
            List<Registration> registrations
    ) {
        return (int) registrations.stream()
                .filter(registration ->
                        registration.getCheckInStatus()
                                == CheckInStatus.PRESENT
                )
                .count();
    }

    private ScheduleStatus determineScheduleStatus(
            ActivityDeparture departure,
            LocalDateTime now
    ) {

        LocalDateTime startDateTime =
                departure.getStartDateTime();

        LocalDateTime endDateTime =
                departure.getEndDateTime();

        if (now.isBefore(startDateTime)) {
            return ScheduleStatus.UPCOMING;
        }

        if (now.isAfter(endDateTime)) {
            return ScheduleStatus.COMPLETED;
        }

        return ScheduleStatus.IN_PROGRESS;
    }
}