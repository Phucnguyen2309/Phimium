package com.be.controller;

import com.be.dto.request.LoginRequest;
import com.be.dto.request.RegisterRequest;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.LoginResponse;
import com.be.dto.response.RegisterResponse;
import com.be.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

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
}
