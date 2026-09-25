package com.be.controller;

import com.be.dto.request.SePayWebhookRequest;
import com.be.dto.response.ApiResponse;
import com.be.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/sepay")
public class SePayWebhookController {
    @Autowired
    PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> handleWebhook(@jakarta.validation.Valid @RequestBody SePayWebhookRequest request,
            @RequestHeader(value = "X-Secret-Key", required = false) String secret){
        paymentService.processPayment(request, secret);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully",null));
    }
}
