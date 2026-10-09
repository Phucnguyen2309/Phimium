package com.be.dto.response;

import com.be.enums.BuddyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuddyResponse {
    private UUID buddyId;
    private UUID userId;
    private String fullName;
    private String bio;
    private java.util.Set<com.be.enums.MatchingTag> interests;
    private java.util.Set<String> skills;
    private java.util.Set<String> languages;
    private com.be.enums.GuidingStyle guidingStyle;
    private String experience;
    private String introduction;
    private String avatarUrl;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private BuddyStatus status;
    private Integer affectedRegistrations;
}
