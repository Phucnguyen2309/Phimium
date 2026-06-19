package com.be.service.impl;

import com.be.dto.request.RegistrationRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.dto.response.RegistrationResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityGroup;
import com.be.entity.InstructionAcknowledgement;
import com.be.entity.Registration;
import com.be.entity.User;
import com.be.enums.CheckInStatus;
import com.be.enums.GroupStatus;
import com.be.enums.RegistrationStatus;
import com.be.enums.UserRole;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.ActivityGroupMapper;
import com.be.mapper.InstructionAcknowledgementMapper;
import com.be.mapper.RegistrationMapper;
import com.be.repository.ActivityGroupRepository;
import com.be.repository.ActivityRepository;
import com.be.repository.InstructionAcknowledgementRepository;
import com.be.repository.RegistrationRepository;
import com.be.repository.UserRepository;
import com.be.service.RegistrationService;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final ActivityGroupRepository activityGroupRepository;
    private final RegistrationMapper registrationMapper;

    private final InstructionAcknowledgementRepository acknowledgementRepository;
    private final InstructionAcknowledgementMapper acknowledgementMapper;
    private final ActivityGroupMapper activityGroupMapper;

    @Override
    @Transactional
    public RegistrationResponse joinActivity(RegistrationRequest request, UUID userId) {
        // 1. Tìm User bằng ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_FOUND));

        // Chỉ cho phép người dùng có role là USER mới được đăng ký tham gia
        if (user.getRole() != UserRole.USER) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        Activity activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));

        // 2. Logic kiểm tra đã đăng ký
        List<Registration> existingRegistrations = registrationRepository.findByUser(user);
        boolean isAlreadyRegistered = existingRegistrations.stream()
                .anyMatch(reg -> reg.getActivity().getId().equals(activity.getId()));

        if (isAlreadyRegistered) {
            throw new AppException(ErrorCode.REGISTRATION_ALREADY_EXISTS);
        }

        // 3. Logic Auto Join
        ActivityGroup assignedGroup = assignOrCreateGroup(activity);

        // 4. Lưu DB Registration
        Registration registration = Registration.builder()
                .activity(activity)
                .user(user)
                .group(assignedGroup)
                .status(RegistrationStatus.ASSIGNED)
                .checkInStatus(CheckInStatus.NOT_YET)
                .build();

        registration = registrationRepository.save(registration);

        // ============================================================
        // 5. LƯU TRẠNG THÁI CHẤP NHẬN ĐIỀU KHOẢN AN TOÀN BẰNG MAPPER
        // ============================================================
        InstructionAcknowledgement acknowledgement = acknowledgementMapper.toEntity(
                registration,
                user,
                activity,
                request.getIsSafetyTermsAccepted()
        );

        acknowledgementRepository.save(acknowledgement);
        // ============================================================

        return registrationMapper.toResponse(registration);
    }

    @Override
    public List<RegistrationResponse> getMyRegistrations(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_FOUND));

        List<Registration> registrations = registrationRepository.findByUser(user);
        return registrationMapper.toResponseList(registrations);
    }

    // ================= HELPER METHODS =================

    private ActivityGroup assignOrCreateGroup(Activity activity) {
        // Lấy tất cả các nhóm hiện có của Activity này
        List<ActivityGroup> existingGroups = activityGroupRepository.findByActivity(activity);

        // Duyệt tìm nhóm đầu tiên còn slot trống
        for (ActivityGroup group : existingGroups) {
            int currentMemberCount = registrationRepository.findByGroup(group).size();
            if (currentMemberCount < group.getMaximumParticipants()) {
                return group; // Ném user vào nhóm này
            }
        }

        // Nếu tất cả các nhóm đều full hoặc chưa có nhóm nào -> Tạo nhóm mới
        int maxParticipants = activity.getGroupMaxSize() != null ? activity.getGroupMaxSize() : 6;

        ActivityGroup newGroup = ActivityGroup.builder()
                .activity(activity)
                .group_name("Nhóm " + (existingGroups.size() + 1) + " - " + activity.getTitle())
                .maximumParticipants(maxParticipants)
                .status(GroupStatus.READY)
                .build();

        return activityGroupRepository.save(newGroup);
    }

    @Override
    public List<ActivityGroupResponse> getMyGroups(UUID userId) {
        // 1. Tìm User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_FOUND));

        // 2. Lấy tất cả lịch sử đăng ký của User này
        List<Registration> registrations = registrationRepository.findByUser(user);

        // 3. Trích xuất Group từ mỗi Registration
        List<ActivityGroup> myGroups = registrations.stream()
                .filter(reg -> reg.getGroup() != null) // Chỉ lấy những đăng ký đã được xếp nhóm
                .map(Registration::getGroup)           // Rút trích Entity Group ra
                .toList();

        // 4. Dùng Mapper chuyển list Entity sang list Response
        return activityGroupMapper.toResponseList(myGroups);
    }

    @Override
    @Transactional
    public RegistrationResponse checkIn(
            UUID registrationId,
            User currentUser
    ) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.REGISTRATION_NOT_FOUND)
                );

        if (!registration.getUser().getUserId()
                .equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        Activity activity = registration.getActivity();

        if (activity == null) {
            throw new AppException(ErrorCode.ACTIVITY_NOT_FOUND);
        }

        LocalDateTime now = DateTimeUtils.nowVietnam();

        if (now.isAfter(activity.getEndTime())) {
            throw new AppException(ErrorCode.CHECKIN_CLOSED);
        }

        if (registration.getCheckInStatus() == CheckInStatus.PRESENT) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        if (registration.getCheckInStatus() == CheckInStatus.ABSENT) {
            throw new AppException(ErrorCode.CHECKIN_CLOSED);
        }

        registration.setCheckInStatus(CheckInStatus.PRESENT);
        registration.setCheckedInAt(now);

        Registration savedRegistration =
                registrationRepository.save(registration);

        return registrationMapper.toResponse(savedRegistration);
    }

    @Override
    @Transactional
    public void autoMarkAbsentAfterActivityEndTime() {
        LocalDateTime now = DateTimeUtils.nowVietnam();

        List<Registration> registrations =
                registrationRepository
                        .findByCheckInStatusAndActivityEndTimeBefore(
                                CheckInStatus.NOT_YET,
                                now
                        );

        for (Registration registration : registrations) {
            registration.setCheckInStatus(CheckInStatus.ABSENT);
        }

        registrationRepository.saveAll(registrations);
    }
}