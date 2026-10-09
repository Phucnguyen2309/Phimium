package com.be.controller;

import com.be.dto.request.*;
import com.be.dto.response.*;
import com.be.entity.User;
import com.be.enums.*;
import com.be.service.impl.MatchingMetadataService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Matching metadata")
public class MatchingMetadataController {
    private final MatchingMetadataService metadata;

    @GetMapping("/api/matching/tags")
    public ApiResponse<Map<String, Object>> tags() {
        return ApiResponse.success("Success", Map.of("tags", Arrays.stream(MatchingTag.values())
                .map(t -> Map.of("code", t.name(), "category", t.getCategory(),
                        "labelVi", t.getLabelVi(), "labelEn", t.getLabelEn())).toList(),
                "guidingStyles", GuidingStyle.values()));
    }

    @GetMapping("/api/activity/{id}/matching")
    public ApiResponse<ActivityMatchingMetadataRequest> activity(@PathVariable UUID id) {
        return ApiResponse.success("Success", metadata.activity(id));
    }

    @PutMapping("/api/v1/admin/activities/{id}/matching")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ActivityMatchingMetadataRequest> updateActivity(@PathVariable UUID id,
            @Valid @RequestBody ActivityMatchingMetadataRequest request) {
        return ApiResponse.success("Success", metadata.updateActivity(id, request));
    }

    @PutMapping("/api/buddies/{id}/matching")
    @PreAuthorize("hasAnyRole('BUDDY','ADMIN')")
    public ApiResponse<BuddyResponse> updateBuddy(@PathVariable UUID id,
            @Valid @RequestBody BuddyMatchingProfileRequest request, @AuthenticationPrincipal User user) {
        return ApiResponse.success("Success", metadata.updateBuddy(id, request, user));
    }
}
