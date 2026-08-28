package com.be.entity;

import com.be.enums.CouponDiscountType;
import com.be.enums.CouponStatus;
import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "coupon_id",
            nullable = false,
            updatable = false
    )
    private UUID couponId;

    @Column(
            name = "code",
            nullable = false,
            unique = true,
            length = 50
    )
    private String code;

    @Column(
            name = "name",
            nullable = false,
            length = 200
    )
    private String name;

    @Column(
            name = "description",
            columnDefinition = "TEXT"
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "discount_type",
            nullable = false,
            length = 20
    )
    private CouponDiscountType discountType;

    @DecimalMin("0.0")
    @Column(
            name = "discount_value",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal discountValue;

    @DecimalMin("0.0")
    @Column(
            name = "minimum_order_amount",
            precision = 12,
            scale = 2
    )
    private BigDecimal minimumOrderAmount;

    @DecimalMin("0.0")
    @Column(
            name = "maximum_discount_amount",
            precision = 12,
            scale = 2
    )
    private BigDecimal maximumDiscountAmount;

    @Column(
            name = "valid_from",
            nullable = false
    )
    private LocalDateTime validFrom;

    @Column(
            name = "valid_until",
            nullable = false
    )
    private LocalDateTime validUntil;

    @Min(1)
    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(
            name = "used_count",
            nullable = false
    )
    @Builder.Default
    private Integer usedCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private CouponStatus status =
            CouponStatus.ACTIVE;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                DateTimeUtils.nowVietnam();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (usedCount == null) {
            usedCount = 0;
        }

        if (status == null) {
            status = CouponStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = DateTimeUtils.nowVietnam();
    }
}