package com.be.controller;

import com.be.dto.request.PriceQuoteRequest;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.PriceQuoteResponse;
import com.be.entity.User;
import com.be.service.PricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
@Tag(name = "Pricing & Quoting", description = "API tính toán báo giá tour và áp dụng mã giảm giá")
public class PricingController {

    private final PricingService pricingService;

    @PostMapping("/quote")
    @Operation(summary = "Tính toán báo giá trước khi đặt tour (Preview Price & Coupon)")
    public ResponseEntity<ApiResponse<PriceQuoteResponse>> calculatePriceQuote(
            @Valid @RequestBody PriceQuoteRequest request,
            @AuthenticationPrincipal User currentUser) {
        PriceQuoteResponse response = pricingService.calculatePriceQuote(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Tính toán giá tour thành công", response));
    }
}