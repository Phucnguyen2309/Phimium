package com.be.entity;


import com.be.enums.GroupStatus;
import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activitygroup")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityGroup {
    @Id
    @GeneratedValue
    @Column(name = "group_id")
    private UUID groupId;

    @Column
    private String group_name;

    @Enumerated(EnumType.STRING)
    private GroupStatus status;

    @Min(1)
    @Column(name = "maximum_participants", nullable = false)
    private Integer maximumParticipants;

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @Column
    private LocalDateTime created_at;

    @PrePersist
    public void prePersist() {
        this.created_at = DateTimeUtils.nowVietnam();
    }
}
