package com.be.service;

import com.be.entity.Coupon;
import java.math.BigDecimal;

public interface CouponService {
    Coupon validateAndGetCoupon(String code, BigDecimal subtotal);
    BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal);
}