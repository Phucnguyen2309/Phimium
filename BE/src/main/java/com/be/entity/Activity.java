package com.be.entity;

import com.be.enums.ActivityStatus;
import com.be.enums.ActivityType;
import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "activities",
        indexes = {
                @Index(name = "idx_activity_type", columnList = "activity_type"),
                @Index(name = "idx_activity_status", columnList = "status"),
                @Index(name = "idx_activity_start_time", columnList = "start_time")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "activity_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 30)
    private ActivityType activityType;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "registration_deadline", nullable = false)
    private LocalDateTime registrationDeadline;

    @Column(name = "location_name", nullable = false, length = 255)
    private String locationName;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @DecimalMin(
            value = "-180.0",
            message = "Longitude must be greater than or equal to -180"
    )
    @DecimalMax(
            value = "180.0",
            message = "Longitude must be less than or equal to 180"
    )
    private BigDecimal longitude;

    @DecimalMin(
            value = "-90.0",
            message = "Latitude must be greater than or equal to -90"
    )
    @DecimalMax(
            value = "90.0",
            message = "Latitude must be less than or equal to 90"
    )
    private BigDecimal latitude;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(
            name = "participation_fee",
            nullable = false,
            precision = 12,
            scale = 2
    )

    private BigDecimal participationFee;

    @Min(1)
    @Column(name = "minimum_participants", nullable = false)
    private Integer minimumParticipants;

    @Min(1)
    @Column(name = "maximum_participants", nullable = false)
    private Integer maximumParticipants;

    @Min(1)
    @Column(name = "group_min_size", nullable = false)

    private Integer groupMinSize = 4;

    @Min(1)
    @Column(name = "group_max_size", nullable = false)

    private Integer groupMaxSize = 6;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)

    private ActivityStatus status = ActivityStatus.PUBLISHED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "created_by",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_activity_created_by")
    )
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "host_id",
            nullable = true,
            foreignKey = @ForeignKey(name = "fk_activity_host")
    )
    private Buddy host;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = DateTimeUtils.nowVietnam();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = ActivityStatus.PUBLISHED;
        }

        if (participationFee == null) {
            participationFee = BigDecimal.ZERO;
        }

        if (groupMinSize == null) {
            groupMinSize = 4;
        }

        if (groupMaxSize == null) {
            groupMaxSize = 6;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = DateTimeUtils.nowVietnam();
    }
}
