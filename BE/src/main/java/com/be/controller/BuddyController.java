package com.be.controller;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.BuddyResponse;
import com.be.entity.User;
import com.be.service.BuddyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/buddies")
@RequiredArgsConstructor
public class BuddyController {

    private final BuddyService buddyService;

    @PatchMapping("/upgrade")
    public ResponseEntity<ApiResponse<BuddyResponse>> upgradeBuddy(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpgradeBuddyRequest request
    ) {
        BuddyResponse response = buddyService.upgradeBuddy(
                user.getUserId(),
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Upgrade to Buddy successfully",
                        response
                )
        );
    }
}
