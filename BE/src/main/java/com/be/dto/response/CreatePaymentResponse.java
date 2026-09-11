package com.be.dto.response;

import com.be.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class CreatePaymentResponse {

    private UUID paymentId;
    private UUID registrationId;
    private String invoiceNumber;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String checkoutUrl;
    private Map<String,String> fields;
}

