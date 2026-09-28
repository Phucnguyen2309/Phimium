package com.be.service;

import com.be.dto.request.FeedBackRequest;
import com.be.dto.response.FeedBackResponse;
import com.be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface FeedBackService {
    FeedBackResponse createFeedBack(
            User currentUserId,
            UUID registrationId,
            FeedBackRequest request
    );

    List<FeedBackResponse> getMyFeedBacks(UUID currentUserId);

    List<FeedBackResponse> getFeedBacksByBuddy(
            User currentUser,
            UUID buddyId
    );

    Page<FeedBackResponse> getAdminFeedbacks(
            String keyword,
            Integer tourRating,
            Integer buddyRating,
            Pageable pageable
    );

    FeedBackResponse getFeedbackDetail(UUID feedbackId);

    void deleteFeedback(UUID feedbackId);
}
