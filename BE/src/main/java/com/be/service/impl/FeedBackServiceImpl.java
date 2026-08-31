package com.be.service.impl;

import com.be.dto.request.FeedBackRequest;
import com.be.dto.response.FeedBackResponse;
import com.be.entity.Buddy;
import com.be.entity.FeedBack;
import com.be.entity.Registration;
import com.be.entity.User;
import com.be.enums.RegistrationStatus;
import com.be.enums.UserRole;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.FeedBackMapper;
import com.be.repository.BuddyRepository;
import com.be.repository.FeedBackRepository;
import com.be.repository.RegistrationRepository;
import com.be.service.FeedBackService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedBackServiceImpl implements FeedBackService {

    private final FeedBackRepository feedBackRepository;
    private final RegistrationRepository registrationRepository;
    private final FeedBackMapper feedBackMapper;
    private final BuddyRepository buddyRepository;

    @Override
    @Transactional
    public FeedBackResponse createFeedBack(
            User currentUser,
            UUID registrationId,
            FeedBackRequest request
    ) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        // 1. Kiểm tra quyền sở hữu đơn đặt tour
        if (!registration.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        // 2. Chặn feedback nếu đơn đã bị CANCELLED hoặc chưa gán Buddy
        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new AppException(ErrorCode.REGISTRATION_ALREADY_CANCELLED);
        }

        Buddy buddy = registration.getBuddy();
        if (buddy == null || registration.getStatus() == RegistrationStatus.WAITING_FOR_BUDDY) {
            throw new AppException(ErrorCode.BUDDY_NOT_FOUND);
        }

        // 3. Kiểm tra đơn đã được đánh giá trước đó chưa (FR-22)
        if (feedBackRepository.existsByRegistration_RegistrationId(registrationId)) {
            throw new AppException(ErrorCode.FEEDBACK_ALREADY_EXISTS);
        }

        // 4. Lưu Feedback
        FeedBack feedback = feedBackMapper.toEntity(
                request,
                currentUser,
                buddy,
                registration
        );
        FeedBack savedFeedback = feedBackRepository.save(feedback);

        // 5. Cập nhật điểm đánh giá trung bình cho Buddy
        updateBuddyRating(buddy, request.getBuddyRating());
        buddyRepository.save(buddy);

        return feedBackMapper.toResponse(savedFeedback);
    }

    @Override
    @Transactional
    public List<FeedBackResponse> getMyFeedBacks(UUID currentUserId) {
        List<FeedBack> feedBacks = feedBackRepository.findByReviewer_UserIdOrderByCreatedAtDesc(currentUserId);
        return feedBackMapper.toResponseList(feedBacks);
    }

    @Override
    public List<FeedBackResponse> getFeedBacksByBuddy(
            User currentUser,
            UUID buddyId
    ) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (currentUser.getRole() != UserRole.BUDDY) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        Buddy currentBuddy = buddyRepository.findByUser_UserId(currentUser.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.BUDDY_NOT_FOUND));

        if (!currentBuddy.getBuddyId().equals(buddyId)) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        List<FeedBack> feedBacks = feedBackRepository.findByBuddy_BuddyIdOrderByCreatedAtDesc(buddyId);
        return feedBackMapper.toResponseList(feedBacks);
    }

    private void updateBuddyRating(Buddy buddy, Integer newRating) {
        if (buddy == null || newRating == null) {
            return;
        }

        int oldReviewCount = buddy.getTotalReviews() != null ? buddy.getTotalReviews() : 0;
        BigDecimal oldAverage = buddy.getAverageRating() != null ? buddy.getAverageRating() : BigDecimal.ZERO;

        int newReviewCount = oldReviewCount + 1;

        // Công thức tính trung bình cộng: ((oldAverage * oldReviewCount) + newRating) / newReviewCount
        BigDecimal totalScore = oldAverage.multiply(BigDecimal.valueOf(oldReviewCount))
                .add(BigDecimal.valueOf(newRating));

        BigDecimal newAverage = totalScore.divide(BigDecimal.valueOf(newReviewCount), 1, RoundingMode.HALF_UP);

        buddy.setAverageRating(newAverage);
        buddy.setTotalReviews(newReviewCount);
    }
}