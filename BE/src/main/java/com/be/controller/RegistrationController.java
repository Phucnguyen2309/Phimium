package com.be.controller;

import com.be.dto.request.AssignBuddyRequest;
import com.be.dto.request.RegistrationRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.BuddyResponse;
import com.be.dto.response.RegistrationResponse;
import com.be.entity.User;
import com.be.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
@Tag(name = "Registration Management", description = "Quản lý đặt tour và thành viên nhóm")
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Đặt tour chính thức (Commit booking)")
    public ResponseEntity<ApiResponse<RegistrationResponse>> createRegistration(
            @Valid @RequestBody RegistrationRequest request,
            @AuthenticationPrincipal User currentUser) {

        RegistrationResponse response = registrationService.joinActivity(request, currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tour registered successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy danh sách các tour tôi đã đăng ký")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getMyRegistrations(
            @AuthenticationPrincipal User currentUser) {

        List<RegistrationResponse> responses = registrationService.getMyRegistrations(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Get registrations successfully", responses));
    }

    @GetMapping("/my-groups")
    @Operation(summary = "Lấy danh sách các nhóm hoạt động của tôi")
    public ResponseEntity<ApiResponse<List<ActivityGroupResponse>>> getMyGroups(
            @AuthenticationPrincipal User currentUser) {

        List<ActivityGroupResponse> responses = registrationService.getMyGroups(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Get groups successfully", responses));
    }

    @GetMapping("/groups/{groupId}")
    @Operation(summary = "Xem chi tiết một nhóm hoạt động")
    public ResponseEntity<ApiResponse<ActivityGroupResponse>> viewGroupDetail(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID groupId) {

        ActivityGroupResponse response = registrationService.getGroupDetail(groupId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Get group details successfully", response));
    }

    @PostMapping("/{registrationId}/check-in")
    @Operation(summary = "Thực hiện check-in ca tour")
    public ResponseEntity<ApiResponse<RegistrationResponse>> checkIn(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID registrationId) {

        RegistrationResponse response = registrationService.checkIn(registrationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Check-in completed successfully", response));
    }

    @PostMapping("/{registrationId}/cancel")
    @Operation(summary = "Hủy đăng ký tour (trước giờ khởi hành)")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelRegistration(
            @PathVariable UUID registrationId,
            @AuthenticationPrincipal User currentUser) {

        RegistrationResponse response = registrationService.cancelRegistration(registrationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Registration cancelled successfully", response));
    }

}