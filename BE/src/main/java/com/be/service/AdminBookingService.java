package com.be.service;

import com.be.dto.request.DepartureRequest;
import com.be.dto.response.AdminDepartureResponse;
import com.be.dto.response.AdminRegistrationResponse;
import com.be.enums.DepartureStatus;
import com.be.enums.RegistrationStatus;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AdminBookingService {
    Page<AdminRegistrationResponse> registrations(UUID activityId, UUID departureId,
                                                   RegistrationStatus status, int page, int size);
    AdminRegistrationResponse registration(UUID id);
    Page<AdminDepartureResponse> departures(UUID activityId, LocalDate from, LocalDate to,
                                             DepartureStatus status, int page, int size);
    AdminDepartureResponse departure(UUID id);
    List<AdminDepartureResponse> createDepartures(UUID activityId, List<DepartureRequest> requests);
    AdminDepartureResponse capacity(UUID id, int totalCapacity);
}
