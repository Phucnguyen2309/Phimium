package com.be.service.impl;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.BuddyResponse;
import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.enums.BuddyStatus;
import com.be.enums.UserRole;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.BuddyMapper;
import com.be.repository.BuddyRepository;
import com.be.repository.UserRepository;
import com.be.service.BuddyService;
import com.be.service.CloudinaryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuddyServiceImpl implements BuddyService {
    private final UserRepository userRepository;
    private final BuddyRepository buddyRepository;
    private final BuddyMapper  buddyMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public BuddyResponse upgradeBuddy(
            UUID currentUserId,
            UpgradeBuddyRequest request,
            MultipartFile image
    ) throws IOException {

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND)
                );

        if (user.getRole() == UserRole.BUDDY) {
            throw new AppException(ErrorCode.USER_ALREADY_BUDDY);
        }

        if (buddyRepository.existsByUser_UserId(currentUserId)) {
            throw new AppException(ErrorCode.BUDDY_ALREADY_EXISTS);
        }

        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        user.setRole(UserRole.BUDDY);
        userRepository.save(user);

        Buddy buddy = buddyMapper.toEntity(request, user);

        if (imageUrl != null) {
            buddy.setAvatarUrl(imageUrl);
        }

        Buddy savedBuddy = buddyRepository.save(buddy);

        return buddyMapper.toResponse(savedBuddy);
    }

    @Override
    public List<BuddyResponse> getAllBuddies(BuddyStatus status) {
        List<Buddy> buddies;
        if (status != null) {
            buddies = buddyRepository.findByStatus(status);
        } else {
            buddies = buddyRepository.findAll();
        }
        return buddies.stream()
                .map(buddyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BuddyResponse updateBuddyStatus(UUID buddyId, BuddyStatus status) {
        Buddy buddy = buddyRepository.findById(buddyId)
                .orElseThrow(() -> new AppException(ErrorCode.BUDDY_NOT_FOUND));

        buddy.setStatus(status);
        Buddy saved = buddyRepository.save(buddy);
        return buddyMapper.toResponse(saved);
    }
}

