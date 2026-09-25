package com.be.service.impl;

import com.be.config.JwtService;
import com.be.dto.request.CompleteProfileRequest;
import com.be.dto.response.*;
import com.be.entity.User;
import com.be.enums.*;
import com.be.exception.*;
import com.be.repository.UserRepository;
import com.be.service.*;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthServiceImpl implements GoogleAuthService {
    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthTokenService authTokenService;

    @Override
    @Transactional
    public GoogleAuthResponse authenticate(String credential) {
        var google = googleTokenVerifier.verify(credential);
        User user = userRepository.findByGoogleSub(google.subject()).orElse(null);
        if (user == null) {
            String email = google.email().trim().toLowerCase(Locale.ROOT);
            User existing = userRepository.findByEmail(email).orElse(null);
            if (existing != null) {
                authTokenService.requireActive(existing);
                if (existing.getGoogleSub() != null) {
                    throw new AppException(ErrorCode.GOOGLE_ACCOUNT_ALREADY_LINKED);
                }
                return GoogleAuthResponse.builder().status(GoogleAuthStatus.ACCOUNT_LINK_REQUIRED)
                        .email(email).message("An account with this email already exists. Authenticate the existing account before linking Google.").build();
            }
            user = User.builder().email(email).googleSub(google.subject()).fullName(google.name())
                    .emailVerified(true).profileCompleted(false).role(UserRole.USER)
                    .status(UserStatus.ACTIVE).build();
            userRepository.saveAndFlush(user);
        }
        authTokenService.requireActive(user);
        if (!user.isEmailVerified()) throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        if (!user.isProfileCompleted()) {
            return GoogleAuthResponse.builder().status(GoogleAuthStatus.PROFILE_REQUIRED)
                    .onboardingToken(jwtService.generateOnboardingToken(user))
                    .email(user.getEmail()).fullName(user.getFullName()).build();
        }
        LoginResponse tokens = authTokenService.issue(user);
        return GoogleAuthResponse.builder().status(GoogleAuthStatus.AUTHENTICATED)
                .accessToken(tokens.getAccessToken()).refreshToken(tokens.getRefreshToken()).build();
    }

    @Override
    @Transactional
    public LoginResponse completeProfile(String authorization, CompleteProfileRequest request) {
        UUID userId = onboardingSubject(authorization);
        User user = userRepository.findLockedById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ONBOARDING_TOKEN));
        authTokenService.requireActive(user);
        if (user.getGoogleSub() == null || user.isProfileCompleted() || !user.isEmailVerified()) {
            throw new AppException(ErrorCode.INVALID_ONBOARDING_TOKEN);
        }
        String phone = request.getPhone().trim();
        if (userRepository.existsByPhoneAndUserIdNot(phone, userId)) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        user.setFullName(request.getFullName().trim());
        user.setBirthday(request.getBirthday());
        user.setPhone(phone);
        user.setProfileCompleted(true);
        userRepository.saveAndFlush(user);
        return authTokenService.issue(user);
    }

    private UUID onboardingSubject(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.INVALID_ONBOARDING_TOKEN);
        }
        String token = authorization.substring(7);
        try {
            var claims = jwtService.extractClaimsJws(token);
            if (!"ONBOARDING".equals(claims.get("tokenType")) || jwtService.isTokenBlacklisted(token)) {
                throw new AppException(ErrorCode.INVALID_ONBOARDING_TOKEN);
            }
            return UUID.fromString(claims.getSubject());
        } catch (ExpiredJwtException e) {
            throw new AppException(ErrorCode.ONBOARDING_TOKEN_EXPIRED);
        } catch (JwtException | IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_ONBOARDING_TOKEN);
        }
    }

    @Override
    @Transactional
    public void link(UUID userId, String credential) {
        var google = googleTokenVerifier.verify(credential);
        User user = userRepository.findLockedById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        authTokenService.requireActive(user);
        if (!user.isEmailVerified() || !user.isProfileCompleted()) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }
        if (!user.getEmail().equals(google.email().trim().toLowerCase(Locale.ROOT))) {
            throw new AppException(ErrorCode.GOOGLE_EMAIL_DOES_NOT_MATCH);
        }
        userRepository.findByGoogleSub(google.subject()).ifPresent(owner -> {
            if (!owner.getUserId().equals(userId)) {
                throw new AppException(ErrorCode.GOOGLE_ACCOUNT_LINKED_TO_ANOTHER_USER);
            }
        });
        if (user.getGoogleSub() != null && !user.getGoogleSub().equals(google.subject())) {
            throw new AppException(ErrorCode.GOOGLE_ACCOUNT_ALREADY_LINKED);
        }
        user.setGoogleSub(google.subject());
        userRepository.saveAndFlush(user);
    }
}
