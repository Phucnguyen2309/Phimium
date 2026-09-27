package com.be.dto.response;

import com.be.enums.DepartureStatus;
import com.be.enums.RegistrationStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

public record AdminDepartureResponse(
        UUID departureId, UUID activityId, String activityTitle,
        LocalDate departureDate, LocalTime startTime, LocalTime endTime, DepartureStatus status,
        long totalCapacity, long remainingSeats, long reservedGuests,
        long totalBookings, long activeBookings, long adultGuests, long childGuests,
        long pendingPaymentGuests, long confirmedGuests, long paymentReviewGuests, long cancelledGuests,
        Map<RegistrationStatus, Counts> countsByStatus) {
    public record Counts(long bookings, long adults, long children, long guests) {}
}
