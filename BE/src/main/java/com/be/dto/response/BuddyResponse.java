package com.be.dto.response;

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
    private String experience;
    private String introduction;
    private String avatarUrl;
    private BigDecimal averageRating;
    private Integer totalReviews;
}
