package com.be.entity;


import com.be.enums.BuddyStatus;
import com.be.enums.GuidingStyle;
import com.be.enums.MatchingTag;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;
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

    @Column(length = 1000)
    private String bio;

    @ElementCollection
    @CollectionTable(name = "buddy_interests", joinColumns = @JoinColumn(name = "buddy_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tag", nullable = false, length = 40)
    @Builder.Default
    private Set<MatchingTag> interests = new LinkedHashSet<>();

    @ElementCollection
    @CollectionTable(name = "buddy_skills", joinColumns = @JoinColumn(name = "buddy_id"))
    @Column(name = "skill", nullable = false, length = 100)
    @Builder.Default
    private Set<String> skills = new LinkedHashSet<>();

    @ElementCollection
    @CollectionTable(name = "buddy_languages", joinColumns = @JoinColumn(name = "buddy_id"))
    @Column(name = "language", nullable = false, length = 3)
    @Builder.Default
    private Set<String> languages = new LinkedHashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "guiding_style", length = 40)
    private GuidingStyle guidingStyle;

    @Column
    private BigDecimal wallet;

    @Column(length = 1000)
    private String experience;

    @Column(length = 1000)
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
