package com.be.entity;

import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "instruction_acknowledgements")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InstructionAcknowledgement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "instruction_acknowledgement_id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "registration_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_instruction_acknowledgement_registration")
    )
    private Registration registration;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_instruction_acknowledgement_user")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "activity_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_instruction_acknowledgement_activity")
    )
    private Activity activity;

    @Column(name = "acknowledged", nullable = false)
    @Builder.Default
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @PrePersist
    @PreUpdate
    protected void updateAcknowledgedAt() {
        if (Boolean.TRUE.equals(acknowledged) && acknowledgedAt == null) {
            acknowledgedAt = DateTimeUtils.nowVietnam();
        }
    }
}
