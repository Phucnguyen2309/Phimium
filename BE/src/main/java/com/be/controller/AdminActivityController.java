package com.be.controller;

import com.be.dto.request.ActivityRequest;
import com.be.dto.request.CreateActivityMultipartRequest;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.ApiResponse;
import com.be.entity.User;
import com.be.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/admin/activities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Activity Management", description = "Quản lý tour và ca khởi hành dành cho Admin")
public class AdminActivityController {
    private final ActivityService activityService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary = "Tạo tour/hoạt động mới",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(
                                    implementation = CreateActivityMultipartRequest.class
                            ),
                            encoding = {
                                    @Encoding(
                                            name = "request",
                                            contentType = MediaType.APPLICATION_JSON_VALUE
                                    ),
                                    @Encoding(
                                            name = "image",
                                            contentType = "image/*"
                                    )
                            }
                    )
            )
    )
    public ResponseEntity<ApiResponse<ActivityResponse>> createActivity(
            @Valid @RequestPart("request") ActivityRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal User currentUser
    ) throws IOException {

        ActivityResponse response = activityService.createActivity(
                request,
                image,
                currentUser
        );

        return ResponseEntity.ok(
                ApiResponse.success("Success", response)
        );
    }
}
