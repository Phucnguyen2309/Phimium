package com.be.entity;

import com.be.enums.CheckInStatus;
import com.be.enums.RegistrationStatus;
import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
            name = "activity_id",
            nullable = false
    )
    private Activity activity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ActivityGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "buddy_id",
            foreignKey = @ForeignKey(
                    name = "fk_registration_buddy"
            )
    )
    private Buddy buddy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RegistrationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "checkin_status",
            nullable = false,
            length = 20
    )
    private CheckInStatus checkInStatus;

    @Column(
            name = "registered_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime registeredAt;

    @Column(name = "buddy_assigned_at")
    private LocalDateTime buddyAssignedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @PrePersist
    protected void onCreate() {

        if (registeredAt == null) {
            registeredAt = DateTimeUtils.nowVietnam();
        }

        if (status == null) {
            status = RegistrationStatus.WAITING_FOR_BUDDY;
        }

        if (checkInStatus == null) {
            checkInStatus = CheckInStatus.NOT_YET;
        }
    }
}
