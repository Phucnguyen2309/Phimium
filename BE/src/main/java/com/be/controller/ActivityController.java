package com.be.controller;

import com.be.dto.request.ActivityMatchingMetadataRequest;
import com.be.dto.response.ActivityDetailResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.MyActivityResponse;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @GetMapping("/{activityId}/matching")
    @Operation(summary = "Đọc tag matching của tour",
            description = "Chỉ trả tag của tour. Lịch trình và ảnh của từng điểm được quản lý bằng API itinerary riêng.")
    public ApiResponse<ActivityMatchingMetadataRequest> getMatchingMetadata(@PathVariable UUID activityId) {
        return ApiResponse.success("Success", activityService.getMatchingMetadata(activityId));
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
