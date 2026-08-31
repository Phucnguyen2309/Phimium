package com.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceQuoteResponse {
    private BigDecimal unitPrice;          // Giá gốc 1 vé người lớn
    private Integer adultCount;
    private Integer childCount;
    private Integer totalGuests;
    private BigDecimal adultSubtotal;      // Tiền vé người lớn
    private BigDecimal childSubtotal;      // Tiền vé trẻ em
    private BigDecimal subtotal;           // Tổng tiền trước giảm giá
    private String couponCode;             // Mã coupon (nếu có)
    private BigDecimal discountAmount;      // Số tiền được giảm
    private Boolean isCouponApplied;       // Có áp dụng được coupon không
    private String couponMessage;          // Thông báo (ví dụ: "Áp dụng thành công", "Mã hết hạn")
    private BigDecimal totalAmount;        // Tổng tiền thực tế phải trả
}