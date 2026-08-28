package com.be.entity;

import com.be.enums.DepartureStatus;
import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "activity_departures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDeparture {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "departure_id",
            nullable = false,
            updatable = false
    )
    private UUID departureId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "activity_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_departure_activity"
            )
    )
    private Activity activity;

    @Column(
            name = "start_time",
            nullable = false
    )
    private LocalDateTime startTime;

    @Column(
            name = "end_time",
            nullable = false
    )
    private LocalDateTime endTime;

    @Min(1)
    @Column(
            name = "capacity",
            nullable = false
    )
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    @Builder.Default
    private DepartureStatus status =
            DepartureStatus.AVAILABLE;

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

        if (status == null) {
            status = DepartureStatus.AVAILABLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = DateTimeUtils.nowVietnam();
    }
}