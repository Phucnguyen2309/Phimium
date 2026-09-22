package com.be.controller;

import com.be.dto.request.LoginRequest;
import com.be.dto.request.RegisterRequest;
import com.be.dto.request.ResendOtpRequest;
import com.be.dto.request.VerifyOtpRequest;
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
