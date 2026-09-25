package com.be.service.impl;

import com.be.config.JwtService;
import com.be.dto.request.*;
import com.be.dto.response.*;
import com.be.entity.User;
import com.be.enums.UserRole;
import com.be.exception.*;
import com.be.repository.UserRepository;
import com.be.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailOtpService emailOtpService;
    private final AuthTokenService authTokenService;

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        if (user.getPassword() == null) throw new AppException(ErrorCode.PASSWORD_LOGIN_UNAVAILABLE);
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        return authTokenService.issue(user);
    }

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String phone = request.getPhone().trim();
        if (userRepo.existsByEmail(email)) throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        if (userRepo.existsByPhone(phone)) throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        User user = User.builder().email(email).password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim()).birthday(request.getBirthday()).phone(phone)
                .role(UserRole.USER).emailVerified(false).profileCompleted(true).build();
        userRepo.saveAndFlush(user);
        emailOtpService.sendOtp(user);
        return new RegisterResponse(user.getEmail(), user.getFullName(), user.getPhone());
    }

    @Override
    public LoginResponse refresh(String token) {
        if (!jwtService.isTokenValid(token) || !"REFRESH".equals(jwtService.extractTokenType(token))) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        try {
            User user = userRepo.findById(UUID.fromString(jwtService.extractSubject(token)))
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
            return authTokenService.issue(user);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    @Override
    public void logout(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        String token = authorizationHeader.substring(7);
        if (!jwtService.isTokenValid(token) || !"ACCESS".equals(jwtService.extractTokenType(token))) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        jwtService.blacklistToken(token);
    }
}
