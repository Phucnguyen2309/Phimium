package com.be.service.impl;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.BuddyResponse;
import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.enums.UserRole;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.BuddyMapper;
import com.be.repository.BuddyRepository;
import com.be.repository.UserRepository;
import com.be.service.BuddyService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuddyServiceImpl implements BuddyService {
    private final UserRepository userRepository;
    private final BuddyRepository buddyRepository;
    private final BuddyMapper  buddyMapper;

    @Override
    @Transactional
    public BuddyResponse upgradeBuddy(
            UUID currentUserId,
            UpgradeBuddyRequest request
    ) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND)
                );

        if (user.getRole() == UserRole.BUDDY) {
            throw new AppException(
                    ErrorCode.USER_ALREADY_BUDDY
            );
        }

        if (buddyRepository.existsByUserUserId(currentUserId)) {
            throw new AppException(
                    ErrorCode.BUDDY_ALREADY_EXISTS
            );
        }

        user.setRole(UserRole.BUDDY);
        userRepository.save(user);

        Buddy buddy = buddyMapper.toEntity(request, user);

        Buddy savedBuddy = buddyRepository.save(buddy);

        return buddyMapper.toResponse(savedBuddy);
    }
}

