package com.be.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceQuoteRequest {

    @NotNull(message = "Departure ID is required")
    private UUID departureId;

    @NotNull(message = "Adult count is required")
    @Min(value = 1, message = "At least 1 adult is required")
    private Integer adultCount;

    @Min(value = 0, message = "Child count cannot be negative")
    private Integer childCount;

    private String couponCode; // Optional
}