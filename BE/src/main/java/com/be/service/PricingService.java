package com.be.service;

import com.be.dto.request.PriceQuoteRequest;
import com.be.dto.response.PriceQuoteResponse;
import com.be.entity.Activity;
import com.be.entity.User;

import java.math.BigDecimal;

public interface PricingService {
    BigDecimal calculateSubtotal(Activity activity, int totalGuests);
    BigDecimal calculateDiscount(String couponCode, BigDecimal subtotal);
    BigDecimal calculateTotal(BigDecimal subtotal, BigDecimal discountAmount);
    PriceQuoteResponse calculatePriceQuote(PriceQuoteRequest request, User currentUser);
}