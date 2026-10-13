package com.be.entity;

import com.be.enums.CheckInStatus;
import com.be.enums.RegistrationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_result_id", unique = true)
    private AiMatchResult matchResult;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ActivityGroup group;

    // 1 Registration -> max 1 Lead Buddy (kept for backward compatibility)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buddy_id")
    private Buddy buddy;

    // Multi-buddy assignment (each buddy carries 1 guest)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "registration_buddies",
            joinColumns = @JoinColumn(name = "registration_id"),
            inverseJoinColumns = @JoinColumn(name = "buddy_id")
    )
    @Builder.Default
    private Set<Buddy> buddies = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Column(name = "adult_count", nullable = false)
    private Integer adultCount;

    @Column(name = "child_count", nullable = false)
    private Integer childCount;

    @Column(name = "pickup_location", length = 500)
    private String pickupLocation;

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
    @Column(name = "checkin_status", nullable = false)
    private CheckInStatus checkInStatus;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @Column(name = "payment_expires_at")
    private LocalDateTime paymentExpiresAt;

    @Column(name = "payment_confirmed_at")
    private LocalDateTime paymentConfirmedAt;

    @Column(name = "buddy_assigned_at")
    private LocalDateTime buddyAssignedAt;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    public void assignBuddies(List<Buddy> assignedBuddies) {
        if (this.buddies == null) {
            this.buddies = new HashSet<>();
        }
        this.buddies.clear();
        if (assignedBuddies != null && !assignedBuddies.isEmpty()) {
            this.buddies.addAll(assignedBuddies);
            this.buddy = assignedBuddies.get(0);
        } else {
            this.buddy = null;
        }
    }

    public void clearBuddies() {
        if (this.buddies != null) {
            this.buddies.clear();
        }
        this.buddy = null;
        this.buddyAssignedAt = null;
    }
}
