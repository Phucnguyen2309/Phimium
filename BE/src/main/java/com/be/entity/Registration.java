package com.be.entity;

import com.be.enums.CheckInStatus;
import com.be.enums.RegistrationStatus;
import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "registration")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "registration_id")
    private UUID registrationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "departure_id",
            nullable = false
    )
    private ActivityDeparture departure;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ActivityGroup group;

    // 1 Registration -> max 1 Buddy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buddy_id")
    private Buddy buddy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Column(name = "adult_count", nullable = false)
    private Integer adultCount;

    @Column(name = "child_count", nullable = false)
    private Integer childCount;

    @Column(
            name = "subtotal",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal subtotal;

    @Column(
            name = "discount_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal discountAmount;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    @Enumerated(EnumType.STRING)
    private CheckInStatus checkInStatus;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @Column(name = "buddy_assigned_at")
    private LocalDateTime buddyAssignedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
