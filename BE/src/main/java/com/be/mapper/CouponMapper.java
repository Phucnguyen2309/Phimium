package com.be.mapper;

import com.be.dto.request.CreateCouponRequest;
import com.be.dto.request.UpdateCouponRequest;
import com.be.dto.response.CouponResponse;
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
    public CouponResponse toResponse(Coupon coupon) {
        if (coupon == null) {
            return null;
        }

        return CouponResponse.builder()
                .couponId(coupon.getCouponId())
                .code(coupon.getCode())
                .name(coupon.getName())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minimumOrderAmount(coupon.getMinimumOrderAmount())
                .maximumDiscountAmount(coupon.getMaximumDiscountAmount())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .status(coupon.getStatus())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }

    public void updateEntity(UpdateCouponRequest request, Coupon coupon) {
        if (request == null || coupon == null) {
            return;
        }

        if (request.getCode() != null) {
            coupon.setCode(request.getCode().trim().toUpperCase());
        }
        if (request.getName() != null) {
            coupon.setName(request.getName());
        }
        if (request.getDescription() != null) {
            coupon.setDescription(request.getDescription());
        }
        if (request.getDiscountType() != null) {
            coupon.setDiscountType(request.getDiscountType());
        }
        if (request.getDiscountValue() != null) {
            coupon.setDiscountValue(request.getDiscountValue());
        }
        if (request.getMinimumOrderAmount() != null) {
            coupon.setMinimumOrderAmount(request.getMinimumOrderAmount());
        }
        if (request.getMaximumDiscountAmount() != null) {
            coupon.setMaximumDiscountAmount(request.getMaximumDiscountAmount());
        }
        if (request.getUsageLimit() != null) {
            coupon.setUsageLimit(request.getUsageLimit());
        }
        if (request.getValidFrom() != null) {
            coupon.setValidFrom(request.getValidFrom());
        }
        if (request.getValidUntil() != null) {
            coupon.setValidUntil(request.getValidUntil());
        }
        if (request.getStatus() != null) {
            coupon.setStatus(request.getStatus());
        }
    }
}