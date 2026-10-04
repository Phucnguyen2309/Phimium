package com.be.controller;

import com.be.config.AuthCookieService;
import com.be.dto.request.*;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.GoogleAuthResponse;
import com.be.dto.response.LoginResponse;
import com.be.dto.response.MeResponse;
import com.be.dto.response.RegisterResponse;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.repository.BuddyRepository;
import com.be.repository.EmailOtpRepository;
import com.be.service.AuthService;
import com.be.service.EmailOtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    @Autowired
    private com.be.service.GoogleAuthService googleAuthService;

    @Autowired
    private AuthCookieService authCookieService;
    @Autowired
    private BuddyRepository buddyRepository;

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<GoogleAuthResponse>> google(
            @Valid @RequestBody GoogleAuthRequest request, HttpServletResponse response) {
        GoogleAuthResponse result = googleAuthService.authenticate(request.getCredential());
        if (result.getAccessToken() != null) {
            // Token chỉ nằm trong cookie HttpOnly, không trả về body cho JavaScript đọc được
            authCookieService.writeTokens(response, result.getAccessToken(), result.getRefreshToken());
            result.setAccessToken(null);
            result.setRefreshToken(null);
        }
        return ResponseEntity.ok(ApiResponse.success("Google authentication", result));
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<ApiResponse<LoginResponse>> completeProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CompleteProfileRequest request, HttpServletResponse response) {
        LoginResponse result = googleAuthService.completeProfile(authorization, request);
        return ResponseEntity.ok(ApiResponse.success("Profile completed", withCookies(result, response)));
    }

    @PostMapping("/link/google")
    public ResponseEntity<ApiResponse<Void>> linkGoogle(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.be.entity.User user,
            @Valid @RequestBody GoogleAuthRequest request) {
        googleAuthService.link(user.getUserId(), request.getCredential());
        return ResponseEntity.ok(ApiResponse.success("Google account linked", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest, HttpServletResponse response) {
        String refreshToken = request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()
                ? request.getRefreshToken()
                : authCookieService.readRefreshToken(httpRequest).orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        try {
            LoginResponse result = authService.refresh(refreshToken);
            return ResponseEntity.ok(ApiResponse.success("Token refreshed", withCookies(result, response)));
        } catch (AppException exception) {
            // Refresh token hỏng / hết hạn -> xoá cookie để FE về trạng thái chưa đăng nhập
            authCookieService.clearTokens(response);
            throw exception;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeResponse>> me(@AuthenticationPrincipal User user) {
        if (user == null) throw new AppException(ErrorCode.INVALID_TOKEN);
        String buddyId = buddyRepository.findByUser_UserId(user.getUserId())
                .map(buddy -> buddy.getBuddyId().toString())
                .orElse(null);
        MeResponse me = MeResponse.builder()
                .userId(user.getUserId().toString())
                .username(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .buddyId(buddyId)
                .build();
        return ResponseEntity.ok(ApiResponse.success("Current user", me));
    }
    @Autowired
    private AuthService authService;
    @Autowired
    private EmailOtpService emailOtpService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
           @Valid @RequestBody RegisterRequest registerRequest){
          RegisterResponse registerResponse = authService.register(registerRequest);
          return ResponseEntity.ok(ApiResponse.success("Register Successfully", registerResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response){
        LoginResponse loginResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login Successfully", withCookies(loginResponse, response)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            HttpServletRequest request, HttpServletResponse response
    ) {
        String header = authorizationHeader != null
                ? authorizationHeader
                : authCookieService.readAccessToken(request).map(token -> "Bearer " + token).orElse(null);
        try {
            if (header != null) authService.logout(header);
        } catch (AppException ignored) {
            // Token đã hết hạn / không hợp lệ: không cần thu hồi, vẫn xoá cookie bên dưới
        }
        authCookieService.clearTokens(response);
        return ResponseEntity.ok(ApiResponse.success("Logout Successfully", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<?>> verifyOtp(@Valid @RequestBody VerifyOtpRequest verifyOtpRequest){
        emailOtpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Verify Otp Successfully",null));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request
    ) {

        emailOtpService.resendOtp(
                request.getEmail()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "OTP sent successfully",
                        null
                )
        );
    }

    /** Ghi token vào cookie HttpOnly và bỏ token khỏi body trả về. */
    private LoginResponse withCookies(LoginResponse result, HttpServletResponse response) {
        authCookieService.writeTokens(response, result.getAccessToken(), result.getRefreshToken());
        result.setAccessToken(null);
        result.setRefreshToken(null);
        return result;
    }

}
