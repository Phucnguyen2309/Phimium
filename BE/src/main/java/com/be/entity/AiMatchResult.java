package com.be.entity;

import com.be.enums.GuidingStyle;
import com.be.enums.MatchingTag;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "ai_match_results", indexes = @Index(name = "idx_ai_match_owner_expiry", columnList = "user_id,expires_at"))
@Getter @Setter @NoArgsConstructor
public class AiMatchResult {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "departure_id", nullable = false)
    private ActivityDeparture departure;
    @Column(nullable = false)
    private int adultCount;
    @Column(nullable = false)
    private int childCount;
    @Column(length = 100)
    private String couponCode;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quotedTotal;
    @Column(nullable = false)
    private LocalDate departureDate;
    @Column(nullable = false)
    private LocalTime startTime;
    @Column(nullable = false)
    private LocalTime endTime;
    @ElementCollection
    @CollectionTable(name = "ai_match_buddies", joinColumns = @JoinColumn(name = "match_result_id"))
    @OrderColumn(name = "buddy_order")
    @Column(name = "buddy_id", nullable = false)
    private List<UUID> buddyIds = new ArrayList<>();
    @ElementCollection
    @CollectionTable(name = "ai_match_tags", joinColumns = @JoinColumn(name = "match_result_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tag", nullable = false, length = 40)
    private Set<MatchingTag> requestedTags = new LinkedHashSet<>();
    @Column(length = 3)
    private String requiredLanguage;
    @Enumerated(EnumType.STRING) @Column(length = 40)
    private GuidingStyle guidingStyle;
    @Column(nullable = false)
    private boolean requireAllTags;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String criteriaJson;
    @Column(nullable = false, length = 64)
    private String metadataFingerprint;
    @Column(nullable = false, length = 40)
    private String engine;
    @Column(length = 100)
    private String modelName;
    @Column(nullable = false, length = 40)
    private String promptVersion;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
