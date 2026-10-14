package com.be.controller;

import com.be.dto.request.BuddyMatchingProfileRequest;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.BuddyResponse;
import com.be.dto.response.BuddyScheduleResponse;
import com.be.dto.response.TourMemberResponse;
import com.be.entity.User;
import com.be.enums.BuddyStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.ActivityService;
import com.be.service.BuddyScheduleService;
import com.be.service.BuddyService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/buddies")
@RequiredArgsConstructor
public class BuddyController {

    private final BuddyService buddyService;

    private final ActivityService activityService;

    private final BuddyScheduleService buddyScheduleService;

    @GetMapping("/getActivityByBuddy")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getActivityByBuddy(UUID buddy) {
        List<ActivityResponse> activityResponses = activityService.getActivitiesByBuddy(buddy);

        return ResponseEntity.ok(ApiResponse.success("success", activityResponses));

    }

    @PutMapping("/{id}/matching")
    @PreAuthorize("hasAnyRole('BUDDY','ADMIN')")
    @Operation(summary = "Cập nhật hồ sơ matching của Buddy")
    public ApiResponse<BuddyResponse> updateMatchingProfile(
            @PathVariable UUID id,
            @Valid @RequestBody BuddyMatchingProfileRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.success("Success", buddyService.updateMatchingProfile(id, request, currentUser));
    }

    @GetMapping("/{id}/matching")
    @PreAuthorize("hasAnyRole('BUDDY','ADMIN')")
    @Operation(summary = "Xem hồ sơ matching của Buddy")
    public ApiResponse<BuddyResponse> getMatchingProfile(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.success("Success", buddyService.getMatchingProfile(id, currentUser));
    }

// BUDDY SCHEDULE & MEMBER MANAGEMENT
    @GetMapping("/me/schedules")
    @PreAuthorize("hasRole('BUDDY')")
    @Operation(summary = "[BUDDY] Xem danh sách các ca tour được phân công")
    public ResponseEntity<ApiResponse<List<BuddyScheduleResponse>>> getMySchedules(
            @AuthenticationPrincipal User currentUser) {
        List<BuddyScheduleResponse> schedules = buddyScheduleService.getMySchedules(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch dẫn tour thành công", schedules));
    }

    @GetMapping("/me/schedules/{departureId}/members")
    @PreAuthorize("hasRole('BUDDY')")
    @Operation(summary = "[BUDDY] Xem danh sách khách và trạng thái điểm danh trong ca tour")
    public ResponseEntity<ApiResponse<List<TourMemberResponse>>> getTourMembers(
            @PathVariable UUID departureId,
            @AuthenticationPrincipal User currentUser) {
        List<TourMemberResponse> members = buddyScheduleService.getTourMembers(departureId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khách tham gia thành công", members));
    }

    @PostMapping("/me/schedules/{departureId}/members/{registrationId}/check-in")
    @PreAuthorize("hasRole('BUDDY')")
    @Operation(summary = "[BUDDY] Điểm danh / Đã đón khách cho đơn đăng ký")
    public ResponseEntity<ApiResponse<TourMemberResponse>> checkInMember(
            @PathVariable UUID departureId,
            @PathVariable UUID registrationId,
            @AuthenticationPrincipal User currentUser) {
        TourMemberResponse response = buddyScheduleService.checkInMember(departureId, registrationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật điểm danh thành công", response));
    }

    @PatchMapping("/me/status")
    @PreAuthorize("hasRole('BUDDY')")
    @Operation(summary = "[BUDDY] Tự cập nhật trạng thái hoạt động (ACTIVE / INACTIVE)")
    public ResponseEntity<ApiResponse<BuddyResponse>> updateMyStatus(
            @AuthenticationPrincipal User currentUser,
            @RequestParam BuddyStatus status
    ) {
        if (status == BuddyStatus.SUSPENDED) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }
        BuddyResponse response = buddyService.updateMyStatus(currentUser, status);
        return ResponseEntity.ok(ApiResponse.success("Status successfully updated", response));
    }

}
