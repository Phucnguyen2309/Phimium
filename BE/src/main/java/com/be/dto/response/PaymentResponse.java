package com.be.dto.response;

import com.be.enums.PaymentMethod;
import com.be.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID id;

    private UUID registrationId;

    private String invoiceNumber;

    private BigDecimal amount;

    private String currency;

    private PaymentStatus status;

    private PaymentMethod paymentMethod;

    private String provider;

    private String providerTransactionId;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;
}
