package com.be.controller;

import com.be.dto.request.UpgradeBuddyMultipartRequest;
import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.BuddyResponse;
import com.be.enums.BuddyStatus;
import com.be.service.BuddyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/buddies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Buddy Management", description = "Quản lý danh sách, duyệt hồ sơ và đình chỉ hoạt động của Buddy")
public class AdminBuddyController {

    private final BuddyService buddyService;

    @PatchMapping(value = "/users/{userId}/upgrade", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "[ADMIN] Nâng tài khoản nhân viên từ USER thành BUDDY",
            description = "userId là tài khoản nhân viên được Admin chọn. Gửi hồ sơ trong part request "
                    + "với Content-Type application/json và file image tùy chọn bằng multipart form-data.",
            requestBody = @RequestBody(required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(implementation = UpgradeBuddyMultipartRequest.class),
                            encoding = {
                                    @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE),
                                    @Encoding(name = "image", contentType = "image/*")
                            })))
    public ResponseEntity<ApiResponse<BuddyResponse>> upgradeBuddy(
            @PathVariable UUID userId,
            @Valid @RequestPart("request") UpgradeBuddyRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        BuddyResponse response = buddyService.upgradeBuddy(userId, request, image);
        return ResponseEntity.ok(ApiResponse.success("Employee upgraded to Buddy successfully", response));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả Buddy (Có thể lọc theo status: ACTIVE, INACTIVE, SUSPENDED)")
    public ResponseEntity<ApiResponse<List<BuddyResponse>>> getBuddies(
            @RequestParam(required = false) BuddyStatus status
    ) {
        List<BuddyResponse> responses = buddyService.getAllBuddies(status);
        return ResponseEntity.ok(ApiResponse.success("Get buddies successfully", responses));
    }

    @PatchMapping("/{buddyId}/status")
    @Operation(summary = "Cập nhật trạng thái Buddy (Duyệt hồ sơ ACTIVE, INACTIVE hoặc đình chỉ SUSPENDED)")
    public ResponseEntity<ApiResponse<BuddyResponse>> updateBuddyStatus(
            @PathVariable UUID buddyId,
            @RequestParam BuddyStatus status
    ) {
        BuddyResponse response = buddyService.updateBuddyStatus(buddyId, status);
        return ResponseEntity.ok(ApiResponse.success("Buddy status updated successfully", response));
    }
}
