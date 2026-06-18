package com.be.service.impl;

import com.be.dto.request.ActivityRequest;
import com.be.dto.response.ActivityResponse;
import com.be.entity.Activity;
import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.ActivityMapper;
import com.be.repository.ActivityRepository;
import com.be.repository.BuddyRepository;
import com.be.repository.UserRepository;
import com.be.service.ActivityService;
import com.be.service.CloudinaryService;
import com.be.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {
    private final ActivityRepository activityRepository;
    private final ActivityMapper activityMapper;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final BuddyRepository buddyRepository;

    @Override
    @Transactional
    public ActivityResponse createActivity(ActivityRequest activityRequest, MultipartFile image,User currentUser) throws IOException {
        Buddy hostBuddy = buddyRepository.findById(activityRequest.getHostId())
                .orElseThrow(() -> new AppException(ErrorCode.BUDDY_NOT_FOUND));

        Activity activity = activityMapper
                .toEntity(activityRequest, currentUser, hostBuddy);


        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            activity.setThumbnailUrl(imageUrl);
        }

        Activity createdActivity = activityRepository.save(activity);

        return activityMapper.toResponse(createdActivity);
    }
}
