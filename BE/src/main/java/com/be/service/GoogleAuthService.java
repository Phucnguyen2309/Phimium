package com.be.service;
import com.be.dto.request.CompleteProfileRequest;
import com.be.dto.response.GoogleAuthResponse;
import com.be.dto.response.LoginResponse;
import java.util.UUID;

public interface GoogleAuthService {
    GoogleAuthResponse authenticate(String credential);
    LoginResponse completeProfile(String authorization, CompleteProfileRequest request);
    void link(UUID userId, String credential);
}
