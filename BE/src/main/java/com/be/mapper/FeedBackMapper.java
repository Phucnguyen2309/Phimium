package com.be.mapper;

import com.be.dto.response.FeedBackResponse;
import com.be.entity.FeedBack;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FeedBackMapper {

    public FeedBackResponse toResponse(FeedBack feedBack) {
        if (feedBack == null) {
            return null;
        }

        return FeedBackResponse.builder()
                .id(feedBack.getId())
                .reviewerId(feedBack.getReviewer() == null ? null : feedBack.getReviewer().getUserId())
                .reviewerName(feedBack.getReviewer() == null ? null : feedBack.getReviewer().getFullName())
                .buddyId(feedBack.getBuddy() == null ? null : feedBack.getBuddy().getBuddyId())
                .registrationId(feedBack.getRegistration() == null ? null : feedBack.getRegistration().getRegistration_id())
                .rating(feedBack.getRating())
                .comment(feedBack.getComment())
                .createdAt(feedBack.getCreatedAt())
                .updatedAt(feedBack.getUpdatedAt())
                .build();
    }

    public List<FeedBackResponse> toResponseList(List<FeedBack> feedBacks) {
        return feedBacks.stream().map(this::toResponse).toList();
    }
}
