package com.be.service.impl;

import com.be.dto.request.DepartureRequest;
import com.be.dto.response.*;
import com.be.entity.*;
import com.be.enums.*;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.RegistrationMapper;
import com.be.repository.*;
import com.be.service.AdminBookingService;
import com.be.util.DateTimeUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
public class AdminBookingServiceImpl implements AdminBookingService {
    private final RegistrationRepository registrations;
    private final ActivityDepartureRepository departures;
    private final ActivityRepository activities;
    private final RegistrationMapper mapper;

    @Override
    public Page<AdminRegistrationResponse> registrations(UUID activityId, UUID departureId,
            RegistrationStatus status, int page, int size) {
        return registrations.findAll((root, query, cb) -> {
            List<Predicate> filters = new ArrayList<>();
            if (activityId != null) filters.add(cb.equal(root.get("departure").get("activity").get("id"), activityId));
            if (departureId != null) filters.add(cb.equal(root.get("departure").get("departureId"), departureId));
            if (status != null) filters.add(cb.equal(root.get("status"), status));
            return cb.and(filters.toArray(Predicate[]::new));
        }, page(page, size, "registeredAt", "registrationId")).map(this::registrationResponse);
    }

    @Override
    public AdminRegistrationResponse registration(UUID id) {
        return registrationResponse(registrations.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND)));
    }

    private AdminRegistrationResponse registrationResponse(Registration registration) {
        User user = registration.getUser();
        return new AdminRegistrationResponse(mapper.toResponse(registration),
                new AdminRegistrationResponse.Customer(user.getUserId(), user.getFullName(),
                        user.getEmail(), user.getPhone()));
    }

    @Override
    public Page<AdminDepartureResponse> departures(UUID activityId, LocalDate from, LocalDate to,
            DepartureStatus status, int page, int size) {
        if (from != null && to != null && from.isAfter(to)) throw new AppException(ErrorCode.VALIDATION_ERROR);
        Page<ActivityDeparture> result = departures.findAll((root, query, cb) -> {
            List<Predicate> filters = new ArrayList<>();
            if (activityId != null) filters.add(cb.equal(root.get("activity").get("id"), activityId));
            if (from != null) filters.add(cb.greaterThanOrEqualTo(root.get("departureDate"), from));
            if (to != null) filters.add(cb.lessThanOrEqualTo(root.get("departureDate"), to));
            if (status != null) filters.add(cb.equal(root.get("status"), status));
            return cb.and(filters.toArray(Predicate[]::new));
        }, page(page, size, "departureDate", "startTime", "departureId"));
        var counts = result.isEmpty() ? List.<RegistrationRepository.DepartureCount>of()
                : registrations.countByDepartures(result.map(ActivityDeparture::getDepartureId).getContent());
        return result.map(departure -> summary(departure, counts));
    }

    @Override
    public AdminDepartureResponse departure(UUID id) {
        return summary(departures.findById(id).orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND)),
                registrations.countByDepartures(List.of(id)));
    }

    @Override
    @Transactional
    public List<AdminDepartureResponse> createDepartures(UUID activityId, List<DepartureRequest> requests) {
        var activity = activities.findById(activityId).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        if (activity.getStatus() == ActivityStatus.CANCELLED || activity.getStatus() == ActivityStatus.COMPLETED)
            throw new AppException(ErrorCode.DEPARTURE_NOT_AVAILABLE);
        Set<String> timeSlots = new HashSet<>();
        for (var request : requests) {
            if (request.getCapacity() < activity.getMinimumParticipants()) {
                throw new AppException(ErrorCode.CAPACITY_LESS_THAN_MINIMUM_PARTICIPANTS);
            }
            if (!LocalDateTime.of(request.getDepartureDate(), request.getStartTime()).isAfter(DateTimeUtils.nowVietnam()))
                throw new AppException(ErrorCode.DEPARTURE_IN_PAST);
            String slot = request.getDepartureDate() + "|" + request.getStartTime() + "|" + request.getEndTime();
            if (!timeSlots.add(slot)) throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        List<ActivityDeparture> saved = departures.saveAll(requests.stream()
                .map(request -> ActivityDeparture.builder().activity(activity)
                        .departureDate(request.getDepartureDate()).startTime(request.getStartTime())
                        .endTime(request.getEndTime()).capacity(request.getCapacity()).build())
                .toList());
        return saved.stream().map(departure -> summary(departure, List.of())).toList();
    }

    @Override
    @Transactional
    public AdminDepartureResponse capacity(UUID id, int totalCapacity) {
        var departure = departures.findByIdWithLock(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));
        if (!departure.getStartDateTime().isAfter(DateTimeUtils.nowVietnam()))
            throw new AppException(ErrorCode.DEPARTURE_IN_PAST);
        if (departure.getStatus() != DepartureStatus.AVAILABLE && departure.getStatus() != DepartureStatus.FULL)
            throw new AppException(ErrorCode.DEPARTURE_NOT_AVAILABLE);
        var counts = registrations.countByDepartures(List.of(id));
        long reserved = summary(departure, counts).reservedGuests();
        if (totalCapacity < 1 || totalCapacity > 1000000) throw new AppException(ErrorCode.VALIDATION_ERROR);
        if (totalCapacity < departure.getActivity().getMinimumParticipants()) {
            throw new AppException(ErrorCode.CAPACITY_LESS_THAN_MINIMUM_PARTICIPANTS);
        }
        if (totalCapacity < reserved) throw new AppException(ErrorCode.INSUFFICIENT_CAPACITY);
        departure.setCapacity((int) (totalCapacity - reserved));
        departure.setStatus(departure.getCapacity() == 0 ? DepartureStatus.FULL : DepartureStatus.AVAILABLE);
        return summary(departure, counts);
    }

    private PageRequest page(int page, int size, String... sort) {
        if (page < 0 || size < 1 || size > 100) throw new AppException(ErrorCode.VALIDATION_ERROR);
        return PageRequest.of(page, size, Sort.by(sort));
    }

    private AdminDepartureResponse summary(ActivityDeparture departure,
            List<RegistrationRepository.DepartureCount> rows) {
        Map<RegistrationStatus, AdminDepartureResponse.Counts> counts = new EnumMap<>(RegistrationStatus.class);
        for (var status : RegistrationStatus.values())
            counts.put(status, new AdminDepartureResponse.Counts(0, 0, 0, 0));
        for (var row : rows) if (departure.getDepartureId().equals(row.getDepartureId()))
            counts.put(row.getStatus(), new AdminDepartureResponse.Counts(row.getBookings(), row.getAdults(),
                    row.getChildren(), row.getAdults() + row.getChildren()));
        long bookings = 0, active = 0, adults = 0, children = 0;
        for (var entry : counts.entrySet()) {
            bookings += entry.getValue().bookings();
            if (entry.getKey() != RegistrationStatus.CANCELLED) {
                active += entry.getValue().bookings();
                adults += entry.getValue().adults();
                children += entry.getValue().children();
            }
        }
        long pending = counts.get(RegistrationStatus.PENDING_PAYMENT).guests();
        long review = counts.get(RegistrationStatus.PAYMENT_REVIEW).guests();
        long reserved = adults + children;
        return new AdminDepartureResponse(departure.getDepartureId(), departure.getActivity().getId(),
                departure.getActivity().getTitle(), departure.getDepartureDate(), departure.getStartTime(),
                departure.getEndTime(), departure.getStatus(), departure.getCapacity() + reserved,
                departure.getCapacity(), reserved, bookings, active, adults, children, pending,
                reserved - pending - review, review, counts.get(RegistrationStatus.CANCELLED).guests(), counts);
    }
}
