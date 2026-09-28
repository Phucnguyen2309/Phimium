package com.be.controller;

import com.be.dto.response.AdminDashboardResponse;
import com.be.dto.response.ApiResponse;
import com.be.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Dashboard", description = "Các chỉ số thống kê tổng quan hệ thống")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Xem tổng quan doanh thu, số lượng đơn, khách hàng và top 5 đơn mới nhất")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getSummary() {
        AdminDashboardResponse response = adminDashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("Get dashboard summary successfully", response));
    }
}