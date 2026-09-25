package com.be.service;


import com.be.dto.request.CreatePaymentRequest;
import com.be.dto.request.SePayWebhookRequest;
import com.be.dto.response.CreatePaymentResponse;
import com.be.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PaymentService {

    CreatePaymentResponse createPayment(UUID registrationId, UUID currentUser, CreatePaymentRequest request);

    void processPayment(SePayWebhookRequest request, String secret);

    Page<PaymentResponse> getMyPayments(Pageable pageable, UUID userId);

    PaymentResponse getPaymentHistory(UUID paymentId,UUID userId);


}
