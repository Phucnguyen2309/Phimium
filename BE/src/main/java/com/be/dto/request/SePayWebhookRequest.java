package com.be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SePayWebhookRequest {
    private String orderInvoiceNumber;
    private String orderId;
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String orderStatus;
    private String signature;
}
