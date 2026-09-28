package com.be.controller;

import com.be.dto.request.CreateCouponRequest;
import com.be.dto.response.ApiResponse;
import com.be.entity.Coupon;
import com.be.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Coupon Management", description = "Quản lý tạo mã giảm giá và bật/tắt kích hoạt mã")
public class AdminCouponController {

    private final CouponService couponService;

    @PostMapping
    @Operation(summary = "Tạo mã khuyến mãi mới")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@Valid @RequestBody CreateCouponRequest request) {
        Coupon coupon = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", coupon));
    }

    @GetMapping
    @Operation(summary = "Xem danh sách toàn bộ mã khuyến mãi")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        List<Coupon> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success("Get coupons successfully", coupons));
    }

    @PatchMapping("/{couponId}/toggle")
    @Operation(summary = "Bật / Tắt trạng thái hoạt động của mã khuyến mãi (ACTIVE <-> INACTIVE)")
    public ResponseEntity<ApiResponse<Coupon>> toggleCouponStatus(@PathVariable UUID couponId) {
        Coupon updated = couponService.toggleCouponStatus(couponId);
        return ResponseEntity.ok(ApiResponse.success("Coupon status toggled successfully", updated));
    }
}