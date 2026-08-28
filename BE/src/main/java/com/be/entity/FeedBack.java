package com.be.entity;
import com.be.util.DateTimeUtils;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;


import jakarta.persistence.*;

@Entity
@Table(name = "feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedBack {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "feedback_id",
            updatable = false,
            nullable = false
    )
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "reviewer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_feedback_reviewer")
    )
    private User reviewer;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "buddy_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_feedback_buddy")
    )
    private Buddy buddy;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "registration_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_feedback_registration")
    )
    private Registration registration;

    @Min(1)
    @Max(5)
    @Column(name = "tour_rating", nullable = false)
    private Integer tourRating;

    @Column(name = "tour_comment", columnDefinition = "TEXT")
    private String tourComment;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = DateTimeUtils.nowVietnam();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = DateTimeUtils.nowVietnam();
    }
}
