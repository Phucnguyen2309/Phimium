package com.be.service;

import com.be.config.JwtService;
import com.be.dto.response.LoginResponse;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthTokenService {
    private final JwtService jwtService;

    public void requireActive(User user) {
        if (!user.isEnabled()) throw new AppException(ErrorCode.ACCOUNT_BLOCKED);
    }

    public LoginResponse issue(User user) {
        requireActive(user);
        if (!user.isEmailVerified()) throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        if (!user.isProfileCompleted()) throw new AppException(ErrorCode.PROFILE_INCOMPLETE);
        String access = jwtService.generateAccessToken(user);
        return LoginResponse.builder().accessToken(access)
                .refreshToken(jwtService.generateRefreshToken(user))
                .username(user.getEmail()).role(user.getRole())
                .buddyId(jwtService.extractBuddyId(access)).build();
    }
}
