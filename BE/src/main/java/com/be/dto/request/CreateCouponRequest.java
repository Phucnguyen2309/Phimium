package com.be.dto.request;

import com.be.enums.CouponDiscountType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCouponRequest {

    @NotBlank(message = "Mã coupon không được để trống")
    @Size(max = 50, message = "Mã coupon tối đa 50 ký tự")
    @Schema(example = "HELLOSUMMER2026", description = "Mã giảm giá (viết liền không dấu)")
    private String code;

    @NotBlank(message = "Tên khuyến mãi không được để trống")
    @Size(max = 200, message = "Tên coupon tối đa 200 ký tự")
    @Schema(example = "Khuyến mãi chào hè 2026", description = "Tên hiển thị của coupon")
    private String name;

    @Schema(example = "Giảm 10% tối đa 100k cho đơn từ 200k", description = "Mô tả chi tiết điều kiện áp dụng")
    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    @Schema(example = "PERCENTAGE", description = "PERCENTAGE hoặc FIXED_AMOUNT")
    private CouponDiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá trị giảm phải lớn hơn 0")
    @Schema(example = "10.0", description = "% giảm (nếu PERCENTAGE) hoặc số tiền cụ thể (nếu FIXED_AMOUNT)")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá trị đơn tối thiểu không được âm")
    @Schema(example = "200000", description = "Giá trị đơn hàng tối thiểu để được áp mã")
    private BigDecimal minimumOrderAmount;

    @DecimalMin(value = "0.0", inclusive = true, message = "Mức giảm tối đa không được âm")
    @Schema(example = "100000", description = "Mức giảm tối đa nếu là PERCENTAGE")
    private BigDecimal maximumDiscountAmount;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Schema(example = "2026-06-01T00:00:00", description = "Thời gian coupon bắt đầu có hiệu lực")
    private LocalDateTime validFrom;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    @Schema(example = "2026-12-31T23:59:59", description = "Thời gian coupon hết hiệu lực")
    private LocalDateTime validUntil;

    @Min(value = 1, message = "Giới hạn sử dụng phải từ 1 trở lên")
    @Schema(example = "100", description = "Tổng số lượt dùng tối đa trên toàn hệ thống")
    private Integer usageLimit;
}