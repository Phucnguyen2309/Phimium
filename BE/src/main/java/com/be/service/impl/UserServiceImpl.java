package com.be.service.impl;

import com.be.dto.response.UserResponse;
import com.be.entity.User;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.UserMapper;
import com.be.repository.UserRepository;
import com.be.service.UserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAdminUsers(String keyword, UserRole role, UserStatus status, Pageable pageable) {
        String search = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim().toLowerCase() : null;

        Page<User> users = userRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null) {
                String pattern = "%" + search + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(root.get("phone"), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);

        return users.map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserDetail(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_FOUND));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(UUID userId, UserStatus status, User currentAdmin) {
        // Không cho phép Admin tự khóa tài khoản của chính mình
        if (currentAdmin.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_FOUND));

        user.setStatus(status);
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }
}