package com.be.controller;

import com.be.dto.response.ApiResponse;
import com.be.dto.response.UserResponse;
import com.be.entity.User;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import com.be.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin User Management", description = "Quản lý danh sách, tìm kiếm và khóa tài khoản người dùng")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lấy danh sách người dùng (hỗ trợ phân trang, lọc role, lọc status, tìm kiếm theo tên/email/phone)")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<UserResponse> responses = userService.getAdminUsers(keyword, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Get users successfully", responses));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Xem thông tin chi tiết của một người dùng")
    public ResponseEntity<ApiResponse<UserResponse>> getUserDetail(@PathVariable UUID userId) {
        UserResponse response = userService.getUserDetail(userId);
        return ResponseEntity.ok(ApiResponse.success("Get user detail successfully", response));
    }

    @PatchMapping("/{userId}/status")
    @Operation(summary = "Khóa hoặc mở khóa tài khoản người dùng (ACTIVE / INACTIVE)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam UserStatus status,
            @AuthenticationPrincipal User currentAdmin
    ) {
        UserResponse response = userService.updateUserStatus(userId, status, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", response));
    }
}