package com.be.service.impl;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.BuddyResponse;
import com.be.entity.Buddy;
import com.be.entity.Registration;
import com.be.entity.User;
import com.be.enums.BuddyStatus;
import com.be.enums.RegistrationStatus;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.BuddyMapper;
import com.be.repository.BuddyRepository;
import com.be.repository.RegistrationRepository;
import com.be.repository.UserRepository;
import com.be.service.BuddyService;
import com.be.service.CloudinaryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuddyServiceImpl implements BuddyService {
    private final UserRepository userRepository;
    private final BuddyRepository buddyRepository;
    private final BuddyMapper  buddyMapper;
    private final CloudinaryService cloudinaryService;
    private final RegistrationRepository registrationRepository;

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

        if (status == BuddyStatus.ACTIVE) {
            User user = buddy.getUser();
            if (user != null && user.getStatus() != UserStatus.ACTIVE) {
                throw new AppException(ErrorCode.ACCOUNT_BLOCKED);
                // Báo lỗi: Tài khoản người dùng đang bị khóa, hãy mở khóa tài khoản trước
            }
        }
        int affectedCount = 0;
        if (status == BuddyStatus.SUSPENDED || status == BuddyStatus.INACTIVE) {
            affectedCount = handleUpcomingRegistrationsWhenBuddyUnavailable(buddy);
        }

        BuddyResponse response = buddyMapper.toResponse(saved);
        response.setAffectedRegistrations(affectedCount);
        return response;
    }

    private int handleUpcomingRegistrationsWhenBuddyUnavailable(Buddy buddy) {
        List<Registration> assignedRegistrations = registrationRepository
                .findByBuddy_BuddyIdAndStatus(buddy.getBuddyId(), RegistrationStatus.BUDDY_ASSIGNED);

        if (assignedRegistrations.isEmpty()) {
            return 0;
        }

        for (Registration reg : assignedRegistrations) {
            reg.clearBuddies();
            reg.setStatus(RegistrationStatus.WAITING_FOR_BUDDY);
        }
        registrationRepository.saveAll(assignedRegistrations);
        return assignedRegistrations.size();
    }
    @Override
    @Transactional
    public BuddyResponse updateMyStatus(User currentUser, BuddyStatus targetStatus) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Buddy buddy = buddyRepository.findByUser_UserId(currentUser.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.BUDDY_NOT_FOUND));

        // 2. Chặn nếu tài khoản đang bị Admin kỷ luật
        if (buddy.getStatus() == BuddyStatus.SUSPENDED) {
            throw new AppException(ErrorCode.BUDDY_SUSPENDED_BY_ADMIN);
        }

        int affectedCount = 0;

        // 3. Nếu Buddy chuyển sang tạm nghỉ (INACTIVE)
        if (targetStatus == BuddyStatus.INACTIVE) {
            List<Registration> assignedRegistrations = registrationRepository
                    .findByBuddy_BuddyIdAndStatus(buddy.getBuddyId(), RegistrationStatus.BUDDY_ASSIGNED);

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime limitTime = now.plusHours(24);

            // Kiểm tra xem có ca tour nào sắp chạy trong 24h tới không
            boolean hasUrgentTour = assignedRegistrations.stream().anyMatch(reg -> {
                if (reg.getDeparture() == null) return false;
                LocalDateTime tourStart = reg.getDeparture().getDepartureDate()
                        .atTime(reg.getDeparture().getStartTime());
                return tourStart.isAfter(now) && tourStart.isBefore(limitTime);
            });

            if (hasUrgentTour) {
                throw new AppException(ErrorCode.BUDDY_HAS_URGENT_TOUR);
            }

            affectedCount = handleUpcomingRegistrationsWhenBuddyUnavailable(buddy);
        }

        buddy.setStatus(targetStatus);
        Buddy saved = buddyRepository.save(buddy);

        BuddyResponse response = buddyMapper.toResponse(saved);
        response.setAffectedRegistrations(affectedCount);
        return response;
    }

}

