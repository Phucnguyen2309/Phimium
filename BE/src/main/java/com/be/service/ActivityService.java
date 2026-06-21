package com.be.service;

import com.be.dto.request.ActivityRequest;
import com.be.dto.response.ActivityDetailResponse;
import com.be.dto.response.ActivityResponse;
import com.be.entity.Buddy;
import com.be.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityService {

    ActivityResponse createActivity(ActivityRequest activityRequest, MultipartFile image, User currentUser) throws IOException;

    List<ActivityResponse> getAllActivities();

    List<ActivityResponse> getActivitiesByBuddy(UUID buddy);

    List<ActivityResponse> getJoinedActivities(User currentUser);

    ActivityDetailResponse getActivityDetail(UUID activityId);
}
