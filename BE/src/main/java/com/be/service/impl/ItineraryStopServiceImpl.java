package com.be.service.impl;

import com.be.dto.request.ItineraryStopRequest;
import com.be.dto.response.ItineraryStopResponse;
import com.be.entity.Activity;
import com.be.entity.ItineraryStop;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.ItineraryStopMapper;
import com.be.repository.ActivityRepository;
import com.be.repository.ItineraryStopRepository;
import com.be.service.CloudinaryService;
import com.be.service.ItineraryStopService;
import com.be.util.DateTimeUtils;
import com.be.validator.ItineraryValidator;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItineraryStopServiceImpl implements ItineraryStopService {
    private static final Comparator<ItineraryStop> TIMELINE_ORDER = Comparator.nullsLast(
            Comparator.comparing(ItineraryStop::getOffsetMinutes, Comparator.nullsLast(Integer::compareTo))
                    .thenComparing(ItineraryStop::getStopId, Comparator.nullsLast(UUID::compareTo)));

    private final ActivityRepository activities;
    private final ItineraryStopRepository stops;
    private final ItineraryStopMapper mapper;
    private final CloudinaryService cloudinaryService;
    private final Validator validator;

    @Override
    @Transactional(readOnly = true)
    public List<ItineraryStopResponse> getStops(UUID activityId) {
        requireActivity(activityId);
        return mapper.toResponseList(stops.findByActivity_IdOrderByStopOrderAscStopIdAsc(activityId));
    }

    @Override
    @Transactional(readOnly = true)
    public ItineraryStopResponse getStop(UUID activityId, UUID stopId) {
        requireActivity(activityId);
        ItineraryStop stop = stops.findByStopIdAndActivity_Id(stopId, activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ITINERARY_STOP_NOT_FOUND));
        return mapper.toResponse(stop);
    }

    @Override
    @Transactional(rollbackFor = IOException.class)
    public ItineraryStopResponse createStop(UUID activityId, ItineraryStopRequest request, MultipartFile image)
            throws IOException {
        Activity activity = lockActivity(activityId);
        validateRequest(request, image);
        ItineraryStop created = mapper.toEntity(request);
        List<ItineraryStop> draft = new ArrayList<>(activity.getItineraryStops());
        draft.add(created);
        validateDraft(draft, activity);

        if (hasImage(image)) {
            created.setImageUrl(uploadImage(image));
        }
        created.setActivity(activity);
        activity.getItineraryStops().add(created);
        save(activity);
        return mapper.toResponse(created);
    }

    @Override
    @Transactional(rollbackFor = IOException.class)
    public ItineraryStopResponse updateStop(UUID activityId, UUID stopId,
                                            ItineraryStopRequest request, MultipartFile image) throws IOException {
        Activity activity = lockActivity(activityId);
        ItineraryStop current = findStop(activity, stopId);
        validateRequest(request, image);
        ItineraryStop replacement = mapper.toEntity(request);
        replacement.setStopId(stopId);
        List<ItineraryStop> draft = new ArrayList<>(activity.getItineraryStops());
        draft.remove(current);
        draft.add(replacement);
        validateDraft(draft, activity);

        String imageUrl = current.getImageUrl();
        if (hasImage(image)) {
            imageUrl = uploadImage(image);
        } else if (Boolean.TRUE.equals(request.getRemoveImage())) {
            imageUrl = null;
        }
        current.setTitle(replacement.getTitle());
        current.setDescription(replacement.getDescription());
        current.setOffsetMinutes(replacement.getOffsetMinutes());
        current.setDurationMinutes(replacement.getDurationMinutes());
        current.setImageUrl(imageUrl);
        save(activity);
        return mapper.toResponse(current);
    }

    @Override
    @Transactional
    public void deleteStop(UUID activityId, UUID stopId) {
        Activity activity = lockActivity(activityId);
        ItineraryStop current = findStop(activity, stopId);
        List<ItineraryStop> draft = new ArrayList<>(activity.getItineraryStops());
        draft.remove(current);
        validateDraft(draft, activity);
        activity.getItineraryStops().remove(current);
        save(activity);
    }

    @Override
    @Transactional
    public ItineraryStopResponse deleteImage(UUID activityId, UUID stopId) {
        Activity activity = lockActivity(activityId);
        ItineraryStop current = findStop(activity, stopId);
        validateDraft(new ArrayList<>(activity.getItineraryStops()), activity);
        current.setImageUrl(null);
        save(activity);
        return mapper.toResponse(current);
    }

    private void requireActivity(UUID activityId) {
        if (!activities.existsById(activityId)) {
            throw new AppException(ErrorCode.ACTIVITY_NOT_FOUND);
        }
    }

    private Activity lockActivity(UUID activityId) {
        return activities.findByIdWithLock(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
    }

    private ItineraryStop findStop(Activity activity, UUID stopId) {
        return activity.getItineraryStops().stream()
                .filter(stop -> Objects.equals(stop.getStopId(), stopId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.ITINERARY_STOP_NOT_FOUND));
    }

    private void validateRequest(ItineraryStopRequest request, MultipartFile image) {
        if (request == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Itinerary stop information is required");
        }
        Set<ConstraintViolation<ItineraryStopRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        if (Boolean.TRUE.equals(request.getRemoveImage()) && hasImage(image)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "removeImage cannot be combined with an image upload");
        }
    }

    private void validateDraft(List<ItineraryStop> draft, Activity activity) {
        draft.sort(TIMELINE_ORDER);
        ItineraryValidator.validate(draft, activity.getDepartures());
    }

    private boolean hasImage(MultipartFile image) {
        return image != null && !image.isEmpty();
    }

    private String uploadImage(MultipartFile image) throws IOException {
        String url = cloudinaryService.uploadImage(image);
        if (url == null || url.isBlank() || url.length() > 2048) {
            throw new AppException(ErrorCode.CLOUDINARY_ERROR);
        }
        return url;
    }

    private void save(Activity activity) {
        List<ItineraryStop> orderedStops = activity.getItineraryStops();
        orderedStops.sort(TIMELINE_ORDER);
        for (int index = 0; index < orderedStops.size(); index++) {
            orderedStops.get(index).setStopOrder(index);
        }
        activity.setUpdatedAt(DateTimeUtils.nowVietnam());
        activities.flush();
    }
}
