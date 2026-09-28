package com.be.controller;

import com.be.dto.response.ApiResponse;
import com.be.dto.response.BuddyResponse;
import com.be.enums.BuddyStatus;
import com.be.service.BuddyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/buddies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Buddy Management", description = "Quản lý danh sách, duyệt hồ sơ và đình chỉ hoạt động của Buddy")
public class AdminBuddyController {

    private final BuddyService buddyService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả Buddy (Có thể lọc theo status: ACTIVE, INACTIVE, SUSPENDED)")
    public ResponseEntity<ApiResponse<List<BuddyResponse>>> getBuddies(
            @RequestParam(required = false) BuddyStatus status
    ) {
        List<BuddyResponse> responses = buddyService.getAllBuddies(status);
        return ResponseEntity.ok(ApiResponse.success("Get buddies successfully", responses));
    }

    @PatchMapping("/{buddyId}/status")
    @Operation(summary = "Cập nhật trạng thái Buddy (Duyệt hồ sơ ACTIVE hoặc đình chỉ SUSPENDED)")
    public ResponseEntity<ApiResponse<BuddyResponse>> updateBuddyStatus(
            @PathVariable UUID buddyId,
            @RequestParam BuddyStatus status
    ) {
        BuddyResponse response = buddyService.updateBuddyStatus(buddyId, status);
        return ResponseEntity.ok(ApiResponse.success("Buddy status updated successfully", response));
    }
}