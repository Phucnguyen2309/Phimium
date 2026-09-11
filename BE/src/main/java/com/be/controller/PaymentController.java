package com.be.controller;

import com.be.dto.request.CreatePaymentRequest;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.CreatePaymentResponse;
import com.be.dto.response.PaymentResponse;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired
    PaymentService paymentService;

    @PostMapping("/registration/{registrationId}")
    public  ResponseEntity<ApiResponse<CreatePaymentResponse>> createPayment(@PathVariable UUID registrationId,
                                                            @RequestBody CreatePaymentRequest createPaymentRequest,
                                                            @AuthenticationPrincipal User currentUser) {
        CreatePaymentResponse response = paymentService.createPayment(registrationId,currentUser.getUserId(),createPaymentRequest);
        return ResponseEntity.ok(ApiResponse.success("Payment created successfully",response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getMyPayments(
            @PageableDefault(
            size = 10,
            sort = "createdAt",
            direction = Sort.Direction.DESC) Pageable pageable
             ,@AuthenticationPrincipal User currentUser) {
        if(currentUser==null) {
             throw new AppException(
                    ErrorCode.USER_NOT_FOUND
            );
        }
        Page<PaymentResponse> payments = paymentService.getMyPayments(pageable,currentUser.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Success",payments));
    }
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @PathVariable UUID paymentId,
            @AuthenticationPrincipal User currentUser
    ) {

        if (currentUser == null) {
            throw new AppException(
                    ErrorCode.USER_NOT_FOUND
            );
        }

        PaymentResponse response =
                paymentService.getPaymentHistory(
                        paymentId,
                        currentUser.getUserId()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Success",
                        response
                )
        );
    }
}
