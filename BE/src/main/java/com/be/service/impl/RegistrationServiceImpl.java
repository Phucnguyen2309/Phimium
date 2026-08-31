package com.be.service.impl;

import com.be.dto.request.PriceQuoteRequest;
import com.be.dto.request.RegistrationRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.dto.response.BuddyResponse;
import com.be.dto.response.PriceQuoteResponse;
import com.be.dto.response.RegistrationResponse;
import com.be.entity.*;
import com.be.enums.*;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.ActivityGroupMapper;
import com.be.mapper.BuddyMapper;
import com.be.mapper.InstructionAcknowledgementMapper;
import com.be.mapper.RegistrationMapper;
import com.be.repository.*;
import com.be.service.BuddyMatchingService;
import com.be.service.PricingService;
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
    private final ActivityDepartureRepository departureRepository;
    private final UserRepository userRepository;
    private final ActivityGroupRepository activityGroupRepository;
    private final CouponRepository couponRepository;
    private final BuddyRepository buddyRepository;

    private final RegistrationMapper registrationMapper;
    private final InstructionAcknowledgementRepository acknowledgementRepository;
    private final InstructionAcknowledgementMapper acknowledgementMapper;
    private final ActivityGroupMapper activityGroupMapper;
    private final BuddyMapper buddyMapper;

    private final PricingService pricingService;
    private final BuddyMatchingService buddyMatchingService;

    @Override
    @Transactional
    public RegistrationResponse joinActivity(RegistrationRequest request, UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_FOUND));

        if (user.getRole() != UserRole.USER) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        int adult = request.getAdultCount() != null ? request.getAdultCount() : 0;
        int child = request.getChildCount() != null ? request.getChildCount() : 0;
        int totalGuests = adult + child;

        // 1. Kiểm tra bắt buộc có ít nhất 1 người lớn
        if (adult < 1) {
            throw new AppException(ErrorCode.AT_LEAST_ONE_ADULT_REQUIRED);
        }

        ActivityDeparture departure = departureRepository.findByIdWithLock(request.getDepartureId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));

        Activity activity = departure.getActivity();

        if (departure.getStatus() != DepartureStatus.AVAILABLE) {
            throw new AppException(ErrorCode.DEPARTURE_NOT_AVAILABLE);
        }

        if (departure.getCapacity() < totalGuests) {
            throw new AppException(ErrorCode.INSUFFICIENT_CAPACITY);
        }

        List<Registration> existingRegistrations = registrationRepository.findByUser(user);
        boolean isAlreadyRegistered = existingRegistrations.stream()
                .anyMatch(reg -> reg.getDeparture().getDepartureId().equals(departure.getDepartureId())
                        && reg.getStatus() != RegistrationStatus.CANCELLED);

        if (isAlreadyRegistered) {
            throw new AppException(ErrorCode.REGISTRATION_ALREADY_EXISTS);
        }

        // 2. Tính toán giá tiền qua PricingService (tự động phân chia giá vé người lớn & trẻ em)
        PriceQuoteRequest quoteRequest = PriceQuoteRequest.builder()
                .departureId(request.getDepartureId())
                .adultCount(adult)
                .childCount(child)
                .couponCode(request.getCouponCode())
                .build();

        PriceQuoteResponse quote = pricingService.calculatePriceQuote(quoteRequest, user);

        // 3. Kiểm tra tính hợp lệ của Coupon và trừ lượt dùng
        Coupon appliedCouponEntity = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            if (!Boolean.TRUE.equals(quote.getIsCouponApplied())) {
                throw new AppException(ErrorCode.COUPON_NOT_APPLICABLE);
            }
            appliedCouponEntity = couponRepository.findByCode(request.getCouponCode().trim()).orElse(null);
            if (appliedCouponEntity != null) {
                appliedCouponEntity.setUsedCount(appliedCouponEntity.getUsedCount() + 1);
                couponRepository.save(appliedCouponEntity);
            }
        }

        // 4. Trừ capacity ca khởi hành
        departure.setCapacity(departure.getCapacity() - totalGuests);
        if (departure.getCapacity() == 0) {
            departure.setStatus(DepartureStatus.FULL);
        }
        departureRepository.save(departure);

        // 5. Gán hoặc tạo nhóm
        ActivityGroup assignedGroup = assignOrCreateGroup(activity);

        // 6. Tạo đơn đăng ký lưu snapshot giá tiền
        Registration registration = Registration.builder()
                .departure(departure)
                .user(user)
                .group(assignedGroup)
                .coupon(appliedCouponEntity)
                .adultCount(adult)
                .childCount(child)
                .subtotal(quote.getSubtotal())
                .discountAmount(quote.getDiscountAmount())
                .totalAmount(quote.getTotalAmount())
                .status(RegistrationStatus.WAITING_FOR_BUDDY)
                .checkInStatus(CheckInStatus.NOT_YET)
                .registeredAt(DateTimeUtils.nowVietnam())
                .build();

        registration = registrationRepository.save(registration);

        // 7. Tự động ghép Buddy
        buddyMatchingService.findAndAssignBuddy(registration);

        // 8. Lưu cam kết an toàn
        InstructionAcknowledgement acknowledgement = acknowledgementMapper.toEntity(
                registration, user, activity, request.getIsSafetyTermsAccepted()
        );
        acknowledgementRepository.save(acknowledgement);

        return registrationMapper.toResponse(registration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationResponse> getMyRegistrations(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_FOUND));

        List<Registration> registrations = registrationRepository.findByUser(user);
        return registrationMapper.toResponseList(registrations);
    }

    private ActivityGroup assignOrCreateGroup(Activity activity) {
        List<ActivityGroup> existingGroups = activityGroupRepository.findByActivity(activity);
        for (ActivityGroup group : existingGroups) {
            int currentMemberCount = registrationRepository.findByGroup(group).size();
            if (currentMemberCount < group.getMaximumParticipants()) {
                return group;
            }
        }
        int maxParticipants = activity.getGroupMaxSize() != null ? activity.getGroupMaxSize() : 6;
        ActivityGroup newGroup = ActivityGroup.builder()
                .activity(activity)
                .groupName("Nhóm " + (existingGroups.size() + 1) + " - " + activity.getTitle())
                .maximumParticipants(maxParticipants)
                .status(GroupStatus.READY)
                .build();
        return activityGroupRepository.save(newGroup);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityGroupResponse> getMyGroups(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_FOUND));
        List<Registration> registrations = registrationRepository.findByUser(user);
        List<ActivityGroup> myGroups = registrations.stream()
                .filter(reg -> reg.getGroup() != null)
                .map(Registration::getGroup)
                .distinct()
                .toList();

        return myGroups.stream()
                .map(group -> {
                    List<Registration> groupRegistrations = registrationRepository.findByGroup(group);
                    return activityGroupMapper.toResponse(group, groupRegistrations);
                }).toList();
    }

    @Override
    @Transactional
    public RegistrationResponse checkIn(UUID registrationId, User currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.USER_NOT_FOUND);

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        if (!registration.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }
        if (registration.getStatus() != RegistrationStatus.BUDDY_ASSIGNED) {
            throw new AppException(ErrorCode.REGISTRATION_CANNOT_CHECK_IN);
        }

        LocalDateTime now = DateTimeUtils.nowVietnam();
        LocalDateTime startTime = registration.getDeparture().getStartTime();
        LocalDateTime endTime = registration.getDeparture().getEndTime();

        if (now.isBefore(startTime.minusMinutes(60))) {
            throw new AppException(ErrorCode.CHECKIN_NOT_OPEN);
        }

        if (now.isAfter(endTime)) {
            throw new AppException(ErrorCode.CHECKIN_CLOSED);
        }

        if (registration.getCheckInStatus() == CheckInStatus.PRESENT) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        registration.setCheckInStatus(CheckInStatus.PRESENT);
        registration.setCheckedInAt(now);
        Registration savedRegistration = registrationRepository.save(registration);
        return registrationMapper.toResponse(savedRegistration);
    }

    @Override
    @Transactional
    public void autoMarkAbsentAfterActivityEndTime() {
        LocalDateTime now = DateTimeUtils.nowVietnam();
        List<Registration> registrations = registrationRepository
                .findByCheckInStatusAndDepartureEndTimeBefore(CheckInStatus.NOT_YET, now);

        List<Registration> validAbsents = registrations.stream()
                .filter(reg -> reg.getStatus() != RegistrationStatus.CANCELLED)
                .peek(reg -> reg.setCheckInStatus(CheckInStatus.ABSENT))
                .toList();

        if (!validAbsents.isEmpty()) {
            registrationRepository.saveAll(validAbsents);
        }
    }
    @Override
    @Transactional(readOnly = true)
    public ActivityGroupResponse getGroupDetail(UUID groupId, User currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.USER_NOT_FOUND);

        ActivityGroup group = activityGroupRepository.findById(groupId)
                .orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_FOUND));

        boolean isParticipant = registrationRepository.existsByGroupGroupIdAndUserUserId(groupId, currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;

        if (!isParticipant && !isAdmin) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        List<Registration> groupRegistrations = registrationRepository.findByGroup(group);
        return activityGroupMapper.toResponse(group, groupRegistrations);
    }

    @Override
    @Transactional
    public RegistrationResponse cancelRegistration(UUID registrationId, User currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.USER_NOT_FOUND);

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        boolean isOwner = registration.getUser().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new AppException(ErrorCode.REGISTRATION_ALREADY_CANCELLED);
        }

        if (registration.getCheckInStatus() == CheckInStatus.PRESENT
                || registration.getStatus() == RegistrationStatus.IN_PROGRESS
                || registration.getStatus() == RegistrationStatus.COMPLETED) {
            throw new AppException(ErrorCode.REGISTRATION_CANNOT_BE_CANCELLED);
        }

        LocalDateTime now = DateTimeUtils.nowVietnam();
        if (now.isAfter(registration.getDeparture().getStartTime())) {
            throw new AppException(ErrorCode.REGISTRATION_CANNOT_BE_CANCELLED);
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(DateTimeUtils.nowVietnam());

        ActivityDeparture departure = departureRepository.findByIdWithLock(registration.getDeparture().getDepartureId())
                .orElse(registration.getDeparture());

        int totalGuests = (registration.getAdultCount() != null ? registration.getAdultCount() : 0)
                + (registration.getChildCount() != null ? registration.getChildCount() : 0);

        departure.setCapacity(departure.getCapacity() + totalGuests);

        if (departure.getStatus() == DepartureStatus.FULL && departure.getCapacity() > 0) {
            departure.setStatus(DepartureStatus.AVAILABLE);
        }
        departureRepository.save(departure);

        if (registration.getCoupon() != null) {
            Coupon coupon = registration.getCoupon();
            if (coupon.getUsedCount() != null && coupon.getUsedCount() > 0) {
                coupon.setUsedCount(coupon.getUsedCount() - 1);
                couponRepository.save(coupon);
            }
        }

        Registration savedRegistration = registrationRepository.save(registration);
        return registrationMapper.toResponse(savedRegistration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BuddyResponse> getAvailableBuddyCandidates(UUID registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        LocalDateTime startTime = registration.getDeparture().getStartTime();
        LocalDateTime endTime = registration.getDeparture().getEndTime();

        List<UUID> busyBuddyIds = registrationRepository.findBusyBuddyIdsInTimeRange(
                startTime, endTime, RegistrationStatus.CANCELLED
        );

        List<Buddy> availableBuddies = buddyRepository.findByStatus(BuddyStatus.ACTIVE).stream()
                .filter(b -> !busyBuddyIds.contains(b.getBuddyId()))
                .toList();

        return buddyMapper.toResponseList(availableBuddies);
    }

    @Override
    @Transactional
    public RegistrationResponse adminAssignBuddy(UUID registrationId, UUID buddyId, User adminUser) {
        if (adminUser.getRole() != UserRole.ADMIN) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));

        if (registration.getStatus() != RegistrationStatus.WAITING_FOR_BUDDY) {
            throw new AppException(ErrorCode.INVALID_REGISTRATION_STATUS);
        }

        Buddy buddy = buddyRepository.findById(buddyId)
                .orElseThrow(() -> new AppException(ErrorCode.BUDDY_NOT_FOUND));

        boolean isBusy = registrationRepository.existsByBuddyAndDepartureTimeOverlap(
                buddy,
                registration.getDeparture().getStartTime(),
                registration.getDeparture().getEndTime(),
                RegistrationStatus.CANCELLED
        );

        if (isBusy) {
            throw new AppException(ErrorCode.BUDDY_SCHEDULE_CONFLICT);
        }

        registration.setBuddy(buddy);
        registration.setBuddyAssignedAt(DateTimeUtils.nowVietnam());
        registration.setStatus(RegistrationStatus.BUDDY_ASSIGNED);

        return registrationMapper.toResponse(registrationRepository.save(registration));
    }
}