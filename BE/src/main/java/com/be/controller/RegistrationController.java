package com.be.controller;

import com.be.dto.request.RegistrationRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.RegistrationResponse;
import com.be.entity.User;
import com.be.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/join")
    public ResponseEntity<RegistrationResponse> joinActivity(
            @Valid @RequestBody RegistrationRequest request,
            @AuthenticationPrincipal User currentUser) { // Tự động lấy User từ SecurityContext

        // Truyền thẳng userId xuống Service
        RegistrationResponse response = registrationService.joinActivity(request, currentUser.getUserId());

        return ResponseEntity.ok(response);
        // Lưu ý: Nếu project của bạn đang bọc mọi response bằng class ApiResponse (như trong code ví dụ bạn gửi)
        // thì sửa dòng này thành: return ResponseEntity.ok(ApiResponse.success("Success", response));
    }

    @GetMapping("/me")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrations(
            @AuthenticationPrincipal User currentUser) {

        List<RegistrationResponse> responses = registrationService.getMyRegistrations(currentUser.getUserId());
        return ResponseEntity.ok(responses);
    }
    @GetMapping("/my-groups")
    public ResponseEntity<List<ActivityGroupResponse>> getMyGroups(
            @AuthenticationPrincipal User currentUser) {

        List<ActivityGroupResponse> responses = registrationService.getMyGroups(currentUser.getUserId());

        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{registrationId}/check-in")
    public ResponseEntity<ApiResponse<RegistrationResponse>> checkIn(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID registrationId
    ) {
        RegistrationResponse response =
                registrationService.checkIn(
                        registrationId,
                        currentUser
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Check-in successfully",
                        response
                )
        );
    }
}