package com.be.controller;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.BuddyResponse;
import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.ActivityService;
import com.be.service.BuddyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/buddies")
@RequiredArgsConstructor
public class BuddyController {

    private final BuddyService buddyService;

    private final ActivityService activityService;

    private final ObjectMapper objectMapper;
    @PatchMapping(
            value = "/upgrade",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<BuddyResponse>> upgradeBuddy(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("bio") String bio,
            @RequestParam("experience") String experience,
            @RequestParam("introduction") String introduction,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws IOException {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        UpgradeBuddyRequest request = UpgradeBuddyRequest.builder()
                .bio(bio)
                .experience(experience)
                .introduction(introduction)
                .build();

        BuddyResponse response =
                buddyService.upgradeBuddy(
                        currentUser.getUserId(),
                        request,
                        image
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Upgrade to Buddy successfully",
                        response
                )
        );
    }

    @GetMapping("/getActivityByBuddy")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getActivityByBuddy(UUID buddy) {
        List<ActivityResponse> activityResponses = activityService.getActivitiesByBuddy(buddy);

        return ResponseEntity.ok(ApiResponse.success("success", activityResponses));

    }

}
