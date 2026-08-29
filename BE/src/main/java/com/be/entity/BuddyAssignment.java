package com.be.entity;

import com.be.enums.BuddyAssignmentStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

public class BuddyAssignment {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(optional = false)
    private Registration registration;

    @ManyToOne(optional = false)
    private Buddy buddy;

    @Enumerated(EnumType.STRING)
    private BuddyAssignmentStatus status;

    private Double matchingScore;

    private LocalDateTime offeredAt;

    private LocalDateTime expiresAt;

    private LocalDateTime respondedAt;

    private String declineReason;
}
