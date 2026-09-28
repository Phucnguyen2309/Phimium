package com.be.controller;

import com.be.dto.response.ApiResponse;
import com.be.dto.response.PaymentResponse;
import com.be.enums.PaymentStatus;
import com.be.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Payment Management", description = "Quản lý và đối soát lịch sử giao dịch thanh toán SePay")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Lấy danh sách giao dịch thanh toán (hỗ trợ phân trang, lọc trạng thái, tìm kiếm mã giao dịch)")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getPayments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PaymentStatus status,
            @ParameterObject @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<PaymentResponse> responses = paymentService.getAdminPayments(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Get payments successfully", responses));
    }

    @GetMapping("/{paymentId}")
    @Operation(summary = "Xem chi tiết một giao dịch thanh toán SePay")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentDetail(@PathVariable UUID paymentId) {
        PaymentResponse response = paymentService.getPaymentDetail(paymentId);
        return ResponseEntity.ok(ApiResponse.success("Get payment detail successfully", response));
    }
}