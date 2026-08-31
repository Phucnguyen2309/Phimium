package com.be.entity;


import com.be.enums.BuddyStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;


@Entity
@Table(name = "buddy")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Buddy {
    @Id
    @GeneratedValue()
    @Column(name = "buddy_id")
    private UUID buddyId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column
    private String bio;

    @Column
    private BigDecimal wallet;

    @Column
    private String experience;

    @Column
    private String introduction;

    @Column
    private String avatarUrl;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private BuddyStatus status = BuddyStatus.ACTIVE;
}
