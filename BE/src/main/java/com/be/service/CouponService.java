package com.be.service;

import com.be.dto.request.CreateCouponRequest;
import com.be.entity.Coupon;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface CouponService {
    Coupon validateAndGetCoupon(String code, BigDecimal subtotal);
    BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal);
    Coupon createCoupon(CreateCouponRequest request);

    List<Coupon> getAllCoupons();

    Coupon toggleCouponStatus(UUID couponId);
}