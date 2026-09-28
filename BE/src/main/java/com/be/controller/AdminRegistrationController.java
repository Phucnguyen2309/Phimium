package com.be.controller;

import com.be.dto.request.AssignBuddyRequest;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.BuddyResponse;
import com.be.dto.response.RegistrationResponse;
import com.be.entity.User;
import com.be.enums.RegistrationStatus;
import com.be.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/registrations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Registration Management", description = "Quản lý đơn đặt tour và điều phối Buddy dành cho Admin")
public class AdminRegistrationController {

    private final RegistrationService registrationService;


    @PostMapping("/{registrationId}/confirm-payment")
    @Operation(
            summary = "Xác nhận thanh toán thủ công (Fallback SePay)",
            description = "Admin duyệt tay khi Webhook SePay bị trễ/lỗi -> Kích hoạt ghép Buddy tự động"
    )
    public ResponseEntity<ApiResponse<RegistrationResponse>> confirmPayment(
            @PathVariable UUID registrationId,
            @AuthenticationPrincipal User adminUser
    ) {
        RegistrationResponse response = registrationService.manualConfirmPayment(registrationId, adminUser);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed manually and buddy assigned", response));
    }

    @GetMapping("/{registrationId}/buddy-candidates")
    @Operation(
            summary = "[ADMIN] Lấy danh sách Buddy khả dụng cho đơn chờ"
    )
    public ResponseEntity<ApiResponse<List<BuddyResponse>>> getBuddyCandidates(@PathVariable UUID registrationId) {
        List<BuddyResponse> candidates = registrationService.getAvailableBuddyCandidates(registrationId);
        return ResponseEntity.ok(ApiResponse.success("Get available buddy candidates successfully", candidates));
    }

    @PostMapping("/{registrationId}/assign-buddy")
    @Operation(
            summary = "[ADMIN] Gán Buddy thủ công cho đơn WAITING_FOR_BUDDY"
    )
    public ResponseEntity<ApiResponse<RegistrationResponse>> assignBuddy(
            @PathVariable UUID registrationId,
            @RequestBody @Valid AssignBuddyRequest request,
            @AuthenticationPrincipal User adminUser) {

        RegistrationResponse response = registrationService.adminAssignBuddy(registrationId, request.getBuddyId(), adminUser);
        return ResponseEntity.ok(ApiResponse.success("Buddy assigned successfully", response));
    }
}
