package com.be.mapper;

import com.be.dto.request.FeedBackRequest;
import com.be.dto.response.CheckInResponse;
import com.be.dto.response.FeedBackResponse;
import com.be.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FeedBackMapper {

    public FeedBack toEntity(
            FeedBackRequest request,
            User reviewer,
            Buddy buddy,
            Registration registration
    ) {
        if (request == null) {
            return null;
        }

        return FeedBack.builder()
                .reviewer(reviewer)
                .buddy(buddy)
                .registration(registration)
                .tripRating(request.getTripRating())
                .tripComment(request.getTripComment())
                .buddyRating(request.getBuddyRating())
                .buddyComment(request.getBuddyComment())
                .build();
    }

    public FeedBackResponse toResponse(FeedBack feedback) {
        if (feedback == null) {
            return null;
        }

        User reviewer = feedback.getReviewer();
        Buddy buddy = feedback.getBuddy();
        Registration registration = feedback.getRegistration();

        return FeedBackResponse.builder()
                .feedbackId(feedback.getId())

                .reviewerId(
                        reviewer == null
                                ? null
                                : reviewer.getUserId()
                )
                .reviewerName(
                        reviewer == null
                                ? null
                                : reviewer.getFullName()
                )

                .buddyId(
                        buddy == null
                                ? null
                                : buddy.getBuddyId()
                )
                .buddyName(
                        buddy == null || buddy.getUser() == null
                                ? null
                                : buddy.getUser().getFullName()
                )

                .registrationId(
                        registration == null
                                ? null
                                : registration.getRegistrationId()
                )

                .activityId(
                        registration == null
                                || registration.getActivity() == null
                                ? null
                                : registration.getActivity().getId()
                )
                .activityTitle(
                        registration == null
                                || registration.getActivity() == null
                                ? null
                                : registration.getActivity().getTitle()
                )

                .tripRating(feedback.getTripRating())
                .tripComment(feedback.getTripComment())
                .buddyRating(feedback.getBuddyRating())
                .buddyComment(feedback.getBuddyComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
    public List<FeedBackResponse> toResponseList(List<FeedBack> feedBacks) {
        return feedBacks.stream().map(this::toResponse).toList();
    }
}