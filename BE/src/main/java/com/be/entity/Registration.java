package com.be.entity;

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
    @GeneratedValue
    private UUID registration_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ActivityGroup group;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    @Column(
            name = "registered_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime registeredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @PrePersist
    protected void onCreate() {
        if (registeredAt == null) {
            registeredAt = DateTimeUtils.nowVietnam();
        }

        if (status == null) {
            status = RegistrationStatus.WAITING_FOR_GROUP;
        }

    }




}
