package com.be.controller;

import com.be.dto.request.FeedBackRequest;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.FeedBackResponse;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.FeedBackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/feedback")
public class FeedBackController {
    private final FeedBackService feedBackService;
    @PostMapping("/registrations/{registrationId}")
    public ResponseEntity<ApiResponse<FeedBackResponse>> createFeedBack(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID registrationId,
            @Valid @RequestBody FeedBackRequest request
    ) {
        FeedBackResponse response = feedBackService.createFeedBack(
                currentUser,
                registrationId,
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Create feedback successfully",
                        response
                )
        );
    }
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<FeedBackResponse>>> getMyFeedBacks(
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        List<FeedBackResponse> response =
                feedBackService.getMyFeedBacks(
                        currentUser.getUserId()
                );

        return ResponseEntity.ok(
                ApiResponse.success("Success", response)
        );
    }

    @GetMapping("/buddies/{buddyId}")
    public ResponseEntity<ApiResponse<List<FeedBackResponse>>> getFeedBacksByBuddy(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID buddyId
    ) {
        List<FeedBackResponse> response =
                feedBackService.getFeedBacksByBuddy(
                        currentUser,
                        buddyId
                );

        return ResponseEntity.ok(
                ApiResponse.success("Success", response)
        );
    }

}
