package com.be.service.impl;

import com.be.config.JwtService;
import com.be.dto.request.LoginRequest;
import com.be.dto.request.RegisterRequest;
import com.be.dto.response.LoginResponse;
import com.be.dto.response.RegisterResponse;
import com.be.entity.User;
import com.be.enums.UserRole;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.repository.UserRepository;
import com.be.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    UserRepository userRepo;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepo.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Tên đăng nhập không tồn tại"));

        boolean ok = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if(!ok){
            throw  new AppException(ErrorCode.INVALID_CREDENTIALS,"Tên đăng nhập hoặc mật khẩu sai");
        }

        String token = jwtService.generateToken(user);
        return LoginResponse.builder()
                .token(token)
                .username(user.getEmail())
                .role(user.getRole())
                .build();
    }



    @Override
    public RegisterResponse register(RegisterRequest registerRequest) {
        if (userRepo.existsByEmail(registerRequest.getEmail())) {
            throw new AppException(
                   ErrorCode.EMAIL_ALREADY_EXISTS, "Tên đăng nhập đã tồn tại"
            );
        }
        User users = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullname())
                .phone(registerRequest.getPhone())
                .birthday(LocalDate.parse(registerRequest.getBirthdate()))
                .role(UserRole.USER)
                .build();
        User saveUser = userRepo.save(users);
        return new RegisterResponse(
                saveUser.getEmail(),
                saveUser.getFullName(),
                saveUser.getPhone()

        );
    }

    @Override
    public void logout(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        String token = authorizationHeader.substring(7);

        if (!jwtService.isTokenValid(token)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        jwtService.blacklistToken(token);
    }
}
