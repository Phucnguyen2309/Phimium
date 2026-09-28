package com.be.service;

import com.be.dto.response.UserResponse;
import com.be.entity.User;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    Page<UserResponse> getAdminUsers(String keyword, UserRole role, UserStatus status, Pageable pageable);

    UserResponse getUserDetail(UUID userId);

    UserResponse updateUserStatus(UUID userId, UserStatus status, User currentAdmin);
}
