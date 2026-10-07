package com.be.controller;

import com.be.dto.request.ActivityRequest;
import com.be.dto.request.CreateActivityMultipartRequest;
import com.be.dto.request.UpdateActivityRequest;
import com.be.dto.request.UpdateActivityMultipartRequest;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;
import java.util.List;

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
                                    ),
                                    @Encoding(
                                            name = "images",
                                            contentType = "image/*"
                                    )
                            }
                    )
            )
    )
    public ResponseEntity<ApiResponse<ActivityResponse>> createActivity(
            @Valid @RequestPart("request") ActivityRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal User currentUser
    ) throws IOException {

        ActivityResponse response = activityService.createActivity(
                request,
                image,
                images,
                currentUser
        );

        return ResponseEntity.ok(
                ApiResponse.success("Success", response)
        );
    }

    @PutMapping(value = "/{activityId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Chỉnh sửa thông tin Tour/Hoạt động",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(implementation = UpdateActivityMultipartRequest.class),
                            encoding = {
                                    @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE),
                                    @Encoding(name = "image", contentType = "image/*"),
                                    @Encoding(name = "images", contentType = "image/*")
                            })))
    public ResponseEntity<ApiResponse<ActivityResponse>> updateActivity(
            @PathVariable UUID activityId,
            @Valid @RequestPart("request") UpdateActivityRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) throws IOException {
        ActivityResponse response = activityService.updateActivity(activityId, request, image, images);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tour thành công", response));
    }

    @DeleteMapping("/{activityId}")
    @Operation(summary = "Xóa Tour (chỉ xóa được khi chưa có lịch khởi hành/booking)")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(@PathVariable UUID activityId) {
        activityService.deleteActivity(activityId);
        return ResponseEntity.ok(ApiResponse.success("Xóa tour thành công", null));
    }
}
