package com.be.service.impl;

import com.be.dto.request.FeedBackRequest;
import com.be.dto.response.FeedBackResponse;
import com.be.entity.Buddy;
import com.be.entity.FeedBack;
import com.be.entity.Registration;
import com.be.entity.User;
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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedBackServiceImpl implements FeedBackService {
    private final FeedBackRepository feedBackRepository;
    private final RegistrationRepository registrationRepository;
    private final FeedBackMapper  feedBackMapper;
    private final BuddyRepository buddyRepository;

    @Override
    @Transactional
    public FeedBackResponse createFeedBack(
            User currentUser,
            UUID registrationId,
            FeedBackRequest request
    ) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.REGISTRATION_NOT_FOUND)
                );

        if (!registration.getUser().getUserId()
                .equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        if (feedBackRepository.existsByRegistrationRegistrationId(registrationId)) {
            throw new AppException(ErrorCode.FEEDBACK_ALREADY_EXISTS);
        }

        Buddy buddy = registration.getActivity().getHost();

        FeedBack feedback = feedBackMapper.toEntity(
                request,
                currentUser,
                buddy,
                registration
        );

        FeedBack savedFeedback = feedBackRepository.save(feedback);

        updateBuddyRating(buddy, request.getBuddyRating());

        buddyRepository.save(buddy);

        return feedBackMapper.toResponse(savedFeedback);
    }

    @Override
    @Transactional
    public List<FeedBackResponse> getMyFeedBacks(UUID currentUserId) {
        List<FeedBack> feedBacks = feedBackRepository.findByReviewerUserIdOrderByCreatedAtDesc(currentUserId);

        return  feedBackMapper.toResponseList(feedBacks);
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

        Buddy currentBuddy = buddyRepository.findByUserUserId(
                currentUser.getUserId()
        ).orElseThrow(() ->
                new AppException(ErrorCode.BUDDY_NOT_FOUND)
        );

        if (!currentBuddy.getBuddyId().equals(buddyId)) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        List<FeedBack> feedBacks =
                feedBackRepository.findByBuddyBuddyIdOrderByCreatedAtDesc(
                        buddyId
                );

        return feedBackMapper.toResponseList(feedBacks);
    }


    private void updateBuddyRating(Buddy buddy, Integer newRating) {
        if (buddy == null || newRating == null) {
            return;
        }

        BigDecimal totalReviews =
                buddy.getTotalReviews() == null
                        ? BigDecimal.ZERO
                        : buddy.getTotalReviews();

        int oldReviewCount = totalReviews.intValue();

        int oldAverage = buddy.getAverageRating();

        int newReviewCount = oldReviewCount + 1;

        int newAverage = Math.round(
                ((oldAverage * oldReviewCount) + newRating)
                        / (float) newReviewCount
        );

        buddy.setAverageRating(newAverage);
        buddy.setTotalReviews(BigDecimal.valueOf(newReviewCount));
    }
}
