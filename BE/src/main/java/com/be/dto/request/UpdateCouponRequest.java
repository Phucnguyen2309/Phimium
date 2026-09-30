package com.be.dto.request;

import com.be.enums.CouponDiscountType;
import com.be.enums.CouponStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    @Schema(example = "SUMMER2026")
    private String code;

    @NotBlank(message = "Coupon name is required")
    @Schema(example = "Khuyến mãi mùa hè 2026")
    private String name;

    @Schema(example = "Giảm giá đặc biệt hè")
    private String description;

    @NotNull(message = "Discount type is required")
    @Schema(example = "PERCENTAGE")
    private CouponDiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", message = "Discount value must be greater than or equal to 0")
    @Schema(example = "15.0")
    private BigDecimal discountValue;

    @Schema(example = "200000.0")
    private BigDecimal minimumOrderAmount;

    @Schema(example = "100000.0")
    private BigDecimal maximumDiscountAmount;

    @NotNull(message = "Valid from date is required")
    @Schema(example = "2026-06-01T00:00:00")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid until date is required")
    @Schema(example = "2026-08-31T23:59:59")
    private LocalDateTime validUntil;

    @Schema(example = "100")
    private Integer usageLimit;

    @Schema(example = "ACTIVE")
    private CouponStatus status;
}