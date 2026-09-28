package com.be.mapper;

import com.be.dto.request.CreateCouponRequest;
import com.be.entity.Coupon;
import com.be.enums.CouponStatus;
import org.springframework.stereotype.Component;

@Component
public class CouponMapper {

    public Coupon toEntity(CreateCouponRequest request) {
        if (request == null) {
            return null;
        }

        return Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minimumOrderAmount(request.getMinimumOrderAmount())
                .maximumDiscountAmount(request.getMaximumDiscountAmount())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .status(CouponStatus.ACTIVE)
                .build();
    }
}