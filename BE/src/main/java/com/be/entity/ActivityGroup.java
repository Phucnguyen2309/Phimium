package com.be.entity;


import com.be.enums.GroupStatus;
import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    @Column(name="group_name")
    private String groupName;

    @Enumerated(EnumType.STRING)
    private GroupStatus status;

    @Min(1)
    @Column(name = "maximum_participants", nullable = false)
    private Integer maximumParticipants;

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @Builder.Default
    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Registration> registrations = new ArrayList<>();

    @Column
    private LocalDateTime created_at;

    @PrePersist
    public void prePersist() {
        this.created_at = DateTimeUtils.nowVietnam();
    }
}
