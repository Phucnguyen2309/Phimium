package com.be.service.impl;

import com.be.dto.request.PriceQuoteRequest;
import com.be.dto.response.PriceQuoteResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityDeparture;
import com.be.entity.Coupon;
import com.be.entity.User;
import com.be.enums.CouponDiscountType;
import com.be.enums.CouponStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.PricingMapper;
import com.be.repository.ActivityDepartureRepository;
import com.be.repository.CouponRepository;
import com.be.service.CouponService;
import com.be.service.PricingService;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService {

    private final CouponService couponService;
    private final ActivityDepartureRepository activityDepartureRepository;
    private final CouponRepository couponRepository;
    private final PricingMapper pricingMapper;

    @Override
    public BigDecimal calculateSubtotal(Activity activity, int totalGuests) {
        BigDecimal basePrice = (activity != null && activity.getParticipationFee() != null)
                ? activity.getParticipationFee()
                : BigDecimal.ZERO;
        return basePrice.multiply(BigDecimal.valueOf(totalGuests));
    }

    @Override
    public BigDecimal calculateDiscount(String couponCode, BigDecimal subtotal) {
        Coupon coupon = couponService.validateAndGetCoupon(couponCode, subtotal);
        return couponService.calculateDiscount(coupon, subtotal);
    }

    @Override
    public BigDecimal calculateTotal(BigDecimal subtotal, BigDecimal discountAmount) {
        if (discountAmount == null) {
            discountAmount = BigDecimal.ZERO;
        }
        BigDecimal total = subtotal.subtract(discountAmount);
        return total.compareTo(BigDecimal.ZERO) > 0 ? total : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public PriceQuoteResponse calculatePriceQuote(PriceQuoteRequest request, User currentUser) {
        ActivityDeparture departure = activityDepartureRepository.findById(request.getDepartureId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));

        int adults = request.getAdultCount() != null ? request.getAdultCount() : 0;
        int children = request.getChildCount() != null ? request.getChildCount() : 0;
        int totalGuests = adults + children;

        if (adults < 1) {
            throw new AppException(ErrorCode.AT_LEAST_ONE_ADULT_REQUIRED);
        }
        BigDecimal adultUnitPrice = departure.getActivity().getParticipationFee() != null
                ? departure.getActivity().getParticipationFee()
                : BigDecimal.ZERO;

// Nếu tour không cấu hình vé trẻ em riêng -> Dùng chung giá vé người lớn
        BigDecimal childUnitPrice = departure.getActivity().getChildParticipationFee() != null
                ? departure.getActivity().getChildParticipationFee()
                : adultUnitPrice;

// Tính chi tiết tiền vé theo từng loại
        BigDecimal adultSubtotal = adultUnitPrice.multiply(BigDecimal.valueOf(adults));
        BigDecimal childSubtotal = childUnitPrice.multiply(BigDecimal.valueOf(children));
        BigDecimal subtotal = adultSubtotal.add(childSubtotal);

        BigDecimal discountAmount = BigDecimal.ZERO;
        boolean isCouponApplied = false;
        String couponMessage = null;

        // Xử lý Coupon
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String code = request.getCouponCode().trim();
            Coupon coupon = couponRepository.findByCode(code).orElse(null);
            LocalDateTime now = DateTimeUtils.nowVietnam();

            if (coupon == null) {
                couponMessage = "Coupon code not found";
            } else if (coupon.getStatus() != CouponStatus.ACTIVE) {
                couponMessage = "Coupon is currently inactive";
            } else if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
                couponMessage = "Coupon is not yet effective";
            } else if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
                couponMessage = "Coupon has expired";
            } else if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                couponMessage = "Coupon usage limit has been reached";
            } else if (coupon.getMinimumOrderAmount() != null && subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
                couponMessage = "Order value does not meet the minimum requirement of " + coupon.getMinimumOrderAmount();
            } else {
                if (coupon.getDiscountType() == CouponDiscountType.PERCENTAGE) {
                    discountAmount = subtotal.multiply(coupon.getDiscountValue())
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                    if (coupon.getMaximumDiscountAmount() != null && discountAmount.compareTo(coupon.getMaximumDiscountAmount()) > 0) {
                        discountAmount = coupon.getMaximumDiscountAmount();
                    }
                } else if (coupon.getDiscountType() == CouponDiscountType.FIXED_AMOUNT) {
                    discountAmount = coupon.getDiscountValue();
                }

                if (discountAmount.compareTo(subtotal) > 0) {
                    discountAmount = subtotal;
                }

                isCouponApplied = true;
                couponMessage = "Coupon applied successfully";
            }
        }

        BigDecimal totalAmount = calculateTotal(subtotal, discountAmount);

        return pricingMapper.toPriceQuoteResponse(
                adultUnitPrice,
                adults,
                children,
                totalGuests,
                adultSubtotal,
                childSubtotal,
                subtotal,
                request.getCouponCode(),
                discountAmount,
                isCouponApplied,
                couponMessage,
                totalAmount
        );
    }
}