package com.be.service.impl;

import com.be.dto.request.ActivityMatchingMetadataRequest;
import com.be.dto.request.ActivityRequest;
import com.be.dto.request.UpdateActivityRequest;
import com.be.dto.response.ActivityDetailResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.MyActivityResponse;
import com.be.entity.Activity;
import com.be.entity.Registration;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.ActivityDetailMapper;
import com.be.mapper.ActivityMapper;
import com.be.mapper.MyActivityMapper;
import com.be.repository.ActivityRepository;
import com.be.repository.RegistrationRepository;
import com.be.service.ActivityService;
import com.be.service.CloudinaryService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
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

    // Không bắt buộc: test dựng service bằng tay sẽ không có translator -> bỏ qua việc dịch
    @Autowired(required = false)
    private ActivityDescriptionTranslator descriptionTranslator;


    @Override
    @Transactional
    public ActivityResponse createActivity(ActivityRequest request, MultipartFile image, List<MultipartFile> images, User currentUser) throws IOException {

        Activity activity = activityMapper.toEntity(request, currentUser);
        applyEnglishDescription(activity, request.getDescriptionEn(), true);

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            activity.setThumbnailUrl(imageUrl);
        }

        if (images != null) {
            for (MultipartFile galleryImage : images) {
                if (galleryImage != null && !galleryImage.isEmpty()) {
                    activity.getImageUrls().add(cloudinaryService.uploadImage(galleryImage));
                }
            }
        }

        Activity savedActivity =
                activityRepository.save(activity);

        return activityMapper.toResponse(savedActivity);
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional
    public ActivityDetailResponse getActivityDetail(UUID activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.ACTIVITY_NOT_FOUND)
                );

        return activityDetailMapper.toResponse(activity);
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityMatchingMetadataRequest getMatchingMetadata(UUID activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        return toMatchingMetadata(activity);
    }

    @Override
    @Transactional
    public ActivityMatchingMetadataRequest updateMatchingMetadata(UUID activityId,
            ActivityMatchingMetadataRequest request) {
        Activity activity = activityRepository.findByIdWithLock(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        activity.getTags().clear();
        activity.getTags().addAll(request.getTags());
        return toMatchingMetadata(activity);
    }

    private ActivityMatchingMetadataRequest toMatchingMetadata(Activity activity) {
        ActivityMatchingMetadataRequest metadata = new ActivityMatchingMetadataRequest();
        metadata.setTags(new LinkedHashSet<>(activity.getTags()));
        return metadata;
    }

    @Override
    @Transactional(rollbackFor = IOException.class)
    public ActivityResponse updateActivity(UUID activityId, UpdateActivityRequest request, MultipartFile image,
                                           List<MultipartFile> images) throws IOException {
        Activity activity = activityRepository.findByIdWithLock(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));

        // Kiểm tra logic số lượng khách
        if (request.getMinimumParticipants() > request.getMaximumParticipants()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        String previousDescription = activity.getDescription();
        activityMapper.updateEntity(request, activity);
        applyEnglishDescription(activity, request.getDescriptionEn(),
                !Objects.equals(previousDescription, activity.getDescription()));

        if (image != null && !image.isEmpty()) {
            activity.setThumbnailUrl(cloudinaryService.uploadImage(image));
        }

        // Xoá ảnh gallery: chỉ giữ những URL đang có của tour mà Admin chọn giữ lại (không nhận URL lạ)
        if (request.getKeptImageUrls() != null) {
            List<String> current = activity.getImageUrls();
            List<String> kept = request.getKeptImageUrls().stream()
                    .filter(url -> url != null && current.contains(url))
                    .distinct()
                    .toList();
            current.clear();
            current.addAll(kept);
        }

        if (images != null) {
            List<String> imageUrls = activity.getImageUrls();
            for (int i = 0; i < images.size(); i++) {
                MultipartFile galleryImage = images.get(i);
                if (galleryImage == null || galleryImage.isEmpty()) {
                    continue;
                }
                String imageUrl = cloudinaryService.uploadImage(galleryImage);
                if (i < imageUrls.size()) {
                    imageUrls.set(i, imageUrl);
                } else {
                    imageUrls.add(imageUrl);
                }
            }
        }

        Activity updated = activityRepository.save(activity);
        return activityMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteActivity(UUID activityId) {
        Activity activity = activityRepository.findByIdWithLock(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        if (activity.getDepartures() != null && !activity.getDepartures().isEmpty()) {
            throw new AppException(ErrorCode.ACTIVITY_CANNOT_BE_DELETED);
        }

        activityRepository.delete(activity);
    }

    @Override
    @Transactional
    public int translateMissingDescriptions() {
        int translated = 0;
        for (Activity activity : activityRepository.findAll()) {
            boolean missing = activity.getDescriptionEn() == null || activity.getDescriptionEn().isBlank();
            if (!missing || activity.getDescription() == null || activity.getDescription().isBlank()) continue;
            applyEnglishDescription(activity, null, false);
            if (activity.getDescriptionEn() != null) translated++;
        }
        return translated;
    }

    /**
     * Mô tả tiếng Anh: admin tự nhập thì dùng luôn. Bỏ trống thì AI dịch từ mô tả tiếng Việt,
     * chỉ khi mô tả tiếng Việt vừa đổi hoặc chưa có bản dịch (tránh gọi AI mỗi lần lưu).
     */
    private void applyEnglishDescription(Activity activity, String providedEn, boolean vietnameseChanged) {
        if (providedEn != null && !providedEn.isBlank()) {
            activity.setDescriptionEn(providedEn.trim());
            return;
        }
        if (activity.getDescription() == null || activity.getDescription().isBlank()) {
            activity.setDescriptionEn(null);
            return;
        }
        boolean missing = activity.getDescriptionEn() == null || activity.getDescriptionEn().isBlank();
        if (!vietnameseChanged && !missing) return;
        activity.setDescriptionEn(descriptionTranslator == null ? null : descriptionTranslator.toEnglish(activity.getDescription()));
    }
}
