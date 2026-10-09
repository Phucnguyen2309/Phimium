package com.be.controller;

import com.be.dto.request.AiMatchRequest;
import com.be.dto.response.*;
import com.be.entity.User;
import com.be.service.impl.AiMatchingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
