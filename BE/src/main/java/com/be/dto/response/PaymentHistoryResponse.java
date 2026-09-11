package com.be.dto.response;

import com.be.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryResponse {
    private UUID id;
    private UUID registrationId;
    private String invoiceNumber;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus paymentStatus;
    private String provider;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
