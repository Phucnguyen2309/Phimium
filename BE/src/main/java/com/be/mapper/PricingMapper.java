package com.be.mapper;

import com.be.dto.response.PriceQuoteResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PricingMapper {

    public PriceQuoteResponse toPriceQuoteResponse(
            BigDecimal unitPrice,
            int adultCount,
            int childCount,
            int totalGuests,
            BigDecimal adultSubtotal,
            BigDecimal childSubtotal,
            BigDecimal subtotal,
            String couponCode,
            BigDecimal discountAmount,
            boolean isCouponApplied,
            String couponMessage,
            BigDecimal totalAmount
    ) {
        return PriceQuoteResponse.builder()
                .unitPrice(unitPrice)
                .adultCount(adultCount)
                .childCount(childCount)
                .totalGuests(totalGuests)
                .adultSubtotal(adultSubtotal)
                .childSubtotal(childSubtotal)
                .subtotal(subtotal)
                .couponCode(couponCode)
                .discountAmount(discountAmount)
                .isCouponApplied(isCouponApplied)
                .couponMessage(couponMessage)
                .totalAmount(totalAmount)
                .build();
    }
}