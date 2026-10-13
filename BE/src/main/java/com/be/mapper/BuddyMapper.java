package com.be.mapper;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.BuddyResponse;
import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.enums.BuddyStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

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
                .interests(new LinkedHashSet<>(request.getInterests()))
                .skills(request.getSkills().stream().map(String::trim)
                        .collect(Collectors.toCollection(LinkedHashSet::new)))
                .languages(request.getLanguages().stream().map(s -> s.trim().toUpperCase(Locale.ROOT))
                        .collect(Collectors.toCollection(LinkedHashSet::new)))
                .guidingStyle(request.getGuidingStyle())
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
                .interests(new LinkedHashSet<>(buddy.getInterests()))
                .skills(new LinkedHashSet<>(buddy.getSkills()))
                .languages(new LinkedHashSet<>(buddy.getLanguages()))
                .guidingStyle(buddy.getGuidingStyle())
                .experience(buddy.getExperience())
                .introduction(buddy.getIntroduction())
                .averageRating(buddy.getAverageRating())
                .totalReviews(buddy.getTotalReviews())
                .avatarUrl(buddy.getAvatarUrl())
                .status(buddy.getStatus())
                .build();
    }

    public List<BuddyResponse> toResponseList(List<Buddy> buddies) {
        if (buddies == null) return List.of();
        return buddies.stream().map(this::toResponse).toList();
    }
}
