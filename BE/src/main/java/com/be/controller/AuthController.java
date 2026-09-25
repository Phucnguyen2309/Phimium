package com.be.controller;

import com.be.dto.request.*;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.LoginResponse;
import com.be.dto.response.RegisterResponse;
import com.be.repository.EmailOtpRepository;
import com.be.service.AuthService;
import com.be.service.EmailOtpService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<com.be.dto.response.GoogleAuthResponse>> google(
            @Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Google authentication", googleAuthService.authenticate(request.getCredential())));
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<ApiResponse<LoginResponse>> completeProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CompleteProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile completed", googleAuthService.completeProfile(authorization, request)));
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
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authService.refresh(request.getRefreshToken())));
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
            @Valid @RequestBody LoginRequest loginRequest){
        LoginResponse loginResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login Successfully", loginResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        authService.logout(authorizationHeader);
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

}
