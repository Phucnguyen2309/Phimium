package com.be.controller;

import com.be.dto.request.AiMatchRequest;
import com.be.dto.response.AiMatchResponse;
import com.be.dto.response.ApiResponse;
import com.be.entity.User;
import com.be.service.AiMatchingService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/matches")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@Tag(name = "AI Smart Matchmaker")
public class AiMatchingController {
    private final AiMatchingService matching;
    @PostMapping
    public ApiResponse<AiMatchResponse> match(@Valid @RequestBody AiMatchRequest request,
                                             @AuthenticationPrincipal User user) {
        return ApiResponse.success("Success", matching.match(request, user));
    }
}
