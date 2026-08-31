package com.be.mapper;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.BuddyResponse;
import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.enums.BuddyStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class BuddyMapper {

    public Buddy toEntity(
            UpgradeBuddyRequest request,
            User user
    ) {
        if (request == null || user == null) {
            return null;
        }

        return Buddy.builder()
                .user(user)
                .bio(request.getBio())
                .experience(request.getExperience())
                .introduction(request.getIntroduction())
                .wallet(BigDecimal.ZERO)
                .averageRating(BigDecimal.valueOf(5.0))
                .totalReviews(0)
                .status(BuddyStatus.ACTIVE)
                .build();
    }

    public BuddyResponse toResponse(Buddy buddy) {
        if (buddy == null) {
            return null;
        }

        return BuddyResponse.builder()
                .buddyId(buddy.getBuddyId())
                .userId(buddy.getUser() == null ? null : buddy.getUser().getUserId())
                .fullName(buddy.getUser() == null ? null : buddy.getUser().getFullName())
                .bio(buddy.getBio())
                .experience(buddy.getExperience())
                .introduction(buddy.getIntroduction())
                .averageRating(buddy.getAverageRating())
                .totalReviews(buddy.getTotalReviews())
                .avatarUrl(buddy.getAvatarUrl())
                .build();
    }

    public List<BuddyResponse> toResponseList(List<Buddy> buddies) {
        if (buddies == null) return List.of();
        return buddies.stream().map(this::toResponse).toList();
    }
}