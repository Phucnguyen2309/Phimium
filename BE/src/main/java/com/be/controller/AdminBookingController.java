package com.be.controller;

import com.be.dto.request.*;
import com.be.dto.response.*;
import com.be.enums.*;
import com.be.service.AdminBookingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Booking Management", description = "Danh sách người đặt tour và sức chứa từng ca khởi hành")
public class AdminBookingController {
    private final AdminBookingService service;

    @GetMapping("/registrations")
    public ApiResponse<Page<AdminRegistrationResponse>> registrations(
            @RequestParam(required = false) UUID activityId, @RequestParam(required = false) UUID departureId,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success("Success", service.registrations(activityId, departureId, status, page, size));
    }

    @GetMapping("/registrations/{id}")
    public ApiResponse<AdminRegistrationResponse> registration(@PathVariable UUID id) {
        return ApiResponse.success("Success", service.registration(id));
    }

    @GetMapping("/departures")
    public ApiResponse<Page<AdminDepartureResponse>> departures(
            @RequestParam(required = false) UUID activityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) DepartureStatus status,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success("Success", service.departures(activityId, from, to, status, page, size));
    }

    @GetMapping("/departures/{id}")
    public ApiResponse<AdminDepartureResponse> departure(@PathVariable UUID id) {
        return ApiResponse.success("Success", service.departure(id));
    }

    @PostMapping("/activities/{activityId}/departures")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<AdminDepartureResponse>> create(
            @PathVariable UUID activityId,
            @RequestBody @Size(min = 1, max = 100) List<@Valid DepartureRequest> requests) {
        return ApiResponse.success("Departures created", service.createDepartures(activityId, requests));
    }

    @PatchMapping("/departures/{id}/capacity")
    public ApiResponse<AdminDepartureResponse> capacity(@PathVariable UUID id, @Valid @RequestBody DepartureCapacityRequest request) {
        return ApiResponse.success("Capacity updated", service.capacity(id, request.totalCapacity()));
    }
}
