package com.be.service.impl;

import com.be.dto.request.ActivityRequest;
import com.be.dto.response.ActivityDetailResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.MyActivityResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityDeparture;
import com.be.entity.Registration;
import com.be.entity.User;
import com.be.enums.DepartureStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.ActivityDetailMapper;
import com.be.mapper.ActivityMapper;
import com.be.mapper.MyActivityMapper;
import com.be.repository.ActivityDepartureRepository;
import com.be.repository.ActivityRepository;
import com.be.repository.RegistrationRepository;
import com.be.service.ActivityService;
import com.be.service.CloudinaryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final ActivityMapper activityMapper;
    private final CloudinaryService cloudinaryService;
    private final RegistrationRepository registrationRepository;
    private final ActivityDetailMapper activityDetailMapper;
    private final MyActivityMapper myActivityMapper;

    private final ActivityDepartureRepository departureRepository;

    @Override
    @Transactional
    public ActivityResponse createActivity(ActivityRequest request, MultipartFile image, User currentUser) throws IOException {

        Activity activity = activityMapper.toEntity(request, currentUser);

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            activity.setThumbnailUrl(imageUrl);
        }

        Activity savedActivity = activityRepository.save(activity);

        ActivityDeparture departure = ActivityDeparture.builder()
                .activity(savedActivity)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .capacity(request.getMaximumParticipants())
                .status(DepartureStatus.AVAILABLE)
                .build();

        departure = departureRepository.save(departure);

        // 3. Nạp departure vào activity để Mapper lấy ra trả về API
        if (savedActivity.getDepartures() == null) {
            savedActivity.setDepartures(new ArrayList<>());
        }
        savedActivity.getDepartures().add(departure);

        return activityMapper.toResponse(savedActivity);
    }

    @Override
    public List<ActivityResponse> getAllActivities() {
        List<Activity> activities = activityRepository.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return activityMapper.toResponseList(activities);
    }

    @Override
    public List<ActivityResponse> getActivitiesByBuddy(UUID buddy) {
        // THEO SRS MỚI: Buddy không còn làm Host của Activity nữa, mà là guide của Registration.
        // Tạm thời trả về list rỗng, để tránh lỗi compile. Team sẽ phải join bảng sau.
        return List.of();
    }

    @Override
    public List<MyActivityResponse> getJoinedActivities(User currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        List<Registration> registrations =
                registrationRepository.findByUser(currentUser);

        return myActivityMapper.toResponseList(registrations);
    }

    @Override
    public ActivityDetailResponse getActivityDetail(UUID activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.ACTIVITY_NOT_FOUND)
                );

        return activityDetailMapper.toResponse(activity);
    }
}