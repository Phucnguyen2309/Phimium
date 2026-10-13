package com.be.dto.response;

import com.be.enums.BuddyStatus;
import com.be.enums.GuidingStyle;
import com.be.enums.MatchingTag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;
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
    private Set<MatchingTag> interests;
    private Set<String> skills;
    private Set<String> languages;
    private GuidingStyle guidingStyle;
    private String experience;
    private String introduction;
    private String avatarUrl;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private BuddyStatus status;
    private Integer affectedRegistrations;
}
