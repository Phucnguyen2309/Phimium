package com.be.service.impl;

import com.be.entity.Coupon;
import com.be.enums.CouponDiscountType;
import com.be.enums.CouponStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.repository.CouponRepository;
import com.be.service.CouponService;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public Coupon validateAndGetCoupon(String code, BigDecimal subtotal) {
        if (code == null || code.trim().isEmpty()) {
            return null;
        }

        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new AppException(ErrorCode.COUPON_INACTIVE);
        }

        LocalDateTime now = DateTimeUtils.nowVietnam();
        if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
            throw new AppException(ErrorCode.COUPON_EXPIRED);
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new AppException(ErrorCode.COUPON_USAGE_LIMIT_REACHED);
        }

        if (coupon.getMinimumOrderAmount() != null && subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new AppException(ErrorCode.COUPON_MINIMUM_NOT_MET);
        }

        return coupon;
    }

    @Override
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == CouponDiscountType.PERCENTAGE) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

            if (coupon.getMaximumDiscountAmount() != null && discount.compareTo(coupon.getMaximumDiscountAmount()) > 0) {
                discount = coupon.getMaximumDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }

        return discount;
    }
}