package com.be.controller;

import com.be.dto.request.ActivityRequest;
import com.be.dto.response.ActivityDetailResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.MyActivityResponse;
import com.be.entity.Activity;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @PostMapping(
            value = "/createActivity",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo tour/hoạt động mới (Chỉ Admin)")
    public ResponseEntity<ApiResponse<ActivityResponse>> createActivity(
            @RequestPart("request") String requestJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal User currentUser
            ) throws IOException {
        ActivityRequest activityRequest =
                objectMapper.readValue(requestJson, ActivityRequest.class);
        Set<ConstraintViolation<ActivityRequest>> violations =
                validator.validate(activityRequest);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        ActivityResponse activityResponse =
                activityService.createActivity(
                        activityRequest,
                        image,
                        currentUser
                );

        return ResponseEntity.ok(
                ApiResponse.success("Success", activityResponse)
        );
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getAllActivity(){
        List<ActivityResponse> activity = activityService.getAllActivities();
        return  ResponseEntity.ok(ApiResponse.success("Success", activity));
    }

    @GetMapping("/joined")
    public ResponseEntity<ApiResponse<List<MyActivityResponse>>> getJoinedActivities(
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        List<MyActivityResponse> response =
                activityService.getJoinedActivities(currentUser);

        return ResponseEntity.ok(
                ApiResponse.success("Success", response)
        );
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<ApiResponse<ActivityDetailResponse>> getActivityDetail(
            @PathVariable UUID activityId
    ) {
        ActivityDetailResponse response =
                activityService.getActivityDetail(activityId);

        return ResponseEntity.ok(
                ApiResponse.success("Success", response)
        );
    }
}
