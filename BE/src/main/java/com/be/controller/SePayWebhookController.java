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
    public ResponseEntity<ApiResponse<?>> handleWebhook(@RequestBody SePayWebhookRequest request){
        paymentService.processPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully",null));
    }
}
