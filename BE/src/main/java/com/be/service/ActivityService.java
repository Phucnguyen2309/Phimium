package com.be.service;

import com.be.dto.request.ActivityMatchingMetadataRequest;
import com.be.dto.request.ActivityRequest;
import com.be.dto.request.UpdateActivityRequest;
import com.be.dto.response.ActivityDetailResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.MyActivityResponse;
import com.be.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface ActivityService {

    ActivityResponse createActivity(ActivityRequest activityRequest, MultipartFile image, List<MultipartFile> images, User currentUser) throws IOException;

    List<ActivityResponse> getAllActivities();

    List<ActivityResponse> getActivitiesByBuddy(UUID buddy);

    List<MyActivityResponse> getJoinedActivities(User currentUser);

    ActivityDetailResponse getActivityDetail(UUID activityId);

    ActivityMatchingMetadataRequest getMatchingMetadata(UUID activityId);

    ActivityMatchingMetadataRequest updateMatchingMetadata(UUID activityId, ActivityMatchingMetadataRequest request);

    /** Dịch (AI) mô tả tiếng Anh cho các tour chưa có bản dịch. Trả về số tour đã dịch. */
    int translateMissingDescriptions();

    ActivityResponse updateActivity(UUID activityId, UpdateActivityRequest request, MultipartFile image,
                                    List<MultipartFile> images) throws IOException;

    void deleteActivity(UUID activityId);
}
