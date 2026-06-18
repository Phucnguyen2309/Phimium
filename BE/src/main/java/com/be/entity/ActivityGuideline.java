package com.be.entity;

import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_guidelines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityGuideline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "guideline_id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "instructions", nullable = false, columnDefinition = "TEXT")
    private String instructions;

    @Column(
            name = "safety_guidelines",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String safetyGuidelines;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (updatedAt == null) {
            updatedAt = DateTimeUtils.nowVietnam();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = DateTimeUtils.nowVietnam();
    }
}
