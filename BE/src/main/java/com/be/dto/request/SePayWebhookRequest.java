package com.be.dto.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SePayWebhookRequest {
    @NotBlank
    private String notificationType;
    @NotNull @Valid
    private Order order;
    @NotNull @Valid
    private Transaction transaction;

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Order {
        @NotBlank private String orderInvoiceNumber;
        @NotBlank private String orderId;
        @NotBlank private String orderStatus;
        @NotBlank private String orderCurrency;
        @NotNull @Positive private BigDecimal orderAmount;
    }

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Transaction {
        @NotBlank private String transactionId;
        @NotBlank private String transactionType;
        @NotBlank private String transactionStatus;
        @NotBlank private String transactionCurrency;
        @NotNull @Positive private BigDecimal transactionAmount;
    }
}
