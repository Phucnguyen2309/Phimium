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
    private final com.be.service.BookingLifecycleService lifecycle;
    private final PaymentRepository paymentRepository;

    @org.springframework.beans.factory.annotation.Value("${booking.hold-minutes:15}")
    private long holdMinutes;

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
        if (child < 0 || adult > 1000 || child > 1000) throw new AppException(ErrorCode.INVALID_GUEST_COUNT);
        if (request.getPickupLocation() == null || request.getPickupLocation().isBlank()
                || request.getPickupLocation().length() > 500 || !Boolean.TRUE.equals(request.getIsSafetyTermsAccepted())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        int totalGuests = adult + child;

        // 1. Kiểm tra bắt buộc có ít nhất 1 người lớn
        if (adult < 1) {
            throw new AppException(ErrorCode.AT_LEAST_ONE_ADULT_REQUIRED);
        }

        ActivityDeparture departure = departureRepository.findByIdWithLock(request.getDepartureId())
                .orElseThrow(() -> new AppException(ErrorCode.DEPARTURE_NOT_FOUND));

        Activity activity = departure.getActivity();
        if (!DateTimeUtils.nowVietnam().isBefore(departure.getStartDateTime())) {
            throw new AppException(ErrorCode.DEPARTURE_IN_PAST);
        }
        int maxGroup = activity.getGroupMaxSize() == null ? 6 : activity.getGroupMaxSize();
        if (totalGuests > maxGroup) throw new AppException(ErrorCode.GROUP_IS_FULL);

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

        // Lock before quoting so concurrent bookings cannot overuse a coupon.
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            couponRepository.findByCodeWithLock(request.getCouponCode().trim())
                    .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_APPLICABLE));
        }
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
        // Group and Buddy are allocated only after payment confirmation.

        // 6. Tạo đơn đăng ký lưu snapshot giá tiền
        Registration registration = Registration.builder()
                .departure(departure)
                .user(user)

                .coupon(appliedCouponEntity)
                .adultCount(adult)
                .childCount(child)
                .pickupLocation(request.getPickupLocation())
                .subtotal(quote.getSubtotal())
                .discountAmount(quote.getDiscountAmount())
                .totalAmount(quote.getTotalAmount())
                .status(RegistrationStatus.PENDING_PAYMENT)
                .checkInStatus(CheckInStatus.NOT_YET)
                .registeredAt(DateTimeUtils.nowVietnam())
                .paymentExpiresAt(DateTimeUtils.nowVietnam().plusMinutes(Math.max(1, holdMinutes))
                        .isBefore(departure.getStartDateTime())
                        ? DateTimeUtils.nowVietnam().plusMinutes(Math.max(1, holdMinutes))
                        : departure.getStartDateTime())
                .build();

        registration = registrationRepository.save(registration);

        // 7. Tự động ghép Buddy
        if (registration.getTotalAmount().signum() == 0) {
            // Free bookings do not create a zero-value SePay transaction.
            lifecycle.confirm(registration);
        }

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
    public RegistrationResponse checkIn(
            UUID registrationId,
            User currentUser
    ) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Registration registration = registrationRepository
                .findByIdWithLock(registrationId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.REGISTRATION_NOT_FOUND)
                );

        // Chỉ user sở hữu registration mới được check-in
        if (!registration.getUser()
                .getUserId()
                .equals(currentUser.getUserId())) {

            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        if (registration.getPaymentConfirmedAt() == null) {
            throw new AppException(ErrorCode.REGISTRATION_CANNOT_CHECK_IN);
        }
        // Chỉ check-in khi đã được assign buddy
        if (registration.getStatus()
                != RegistrationStatus.BUDDY_ASSIGNED) {

            throw new AppException(
                    ErrorCode.REGISTRATION_CANNOT_CHECK_IN
            );
        }

        // Không cho check-in lần 2
        if (registration.getCheckInStatus()
                == CheckInStatus.PRESENT) {

            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        ActivityDeparture departure =
                registration.getDeparture();

        LocalDateTime now =
                DateTimeUtils.nowVietnam();

        LocalDateTime startDateTime =
                departure.getStartDateTime();

        LocalDateTime endDateTime =
                departure.getEndDateTime();

        // Mở check-in trước giờ bắt đầu 60 phút
        LocalDateTime checkInOpenTime =
                startDateTime.minusMinutes(60);

        if (now.isBefore(checkInOpenTime)) {
            throw new AppException(ErrorCode.CHECKIN_NOT_OPEN);
        }

        // Đóng check-in sau khi tour kết thúc
        if (now.isAfter(endDateTime)) {
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
        List<Registration> registrations = registrationRepository
                .findByCheckInStatusAndDepartureEndedBefore(
                        CheckInStatus.NOT_YET, now.toLocalDate(), now.toLocalTime());

        List<Registration> validAbsents = registrations.stream()
                .filter(reg -> reg.getPaymentConfirmedAt() != null && reg.getStatus() != RegistrationStatus.CANCELLED)
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
    public RegistrationResponse cancelRegistration(
            UUID registrationId,
            User currentUser
    ) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Registration registration = registrationRepository.findByIdWithLock(registrationId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.REGISTRATION_NOT_FOUND)
                );

        boolean isOwner = registration.getUser()
                .getUserId()
                .equals(currentUser.getUserId());

        boolean isAdmin =
                currentUser.getRole() == UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new AppException(
                    ErrorCode.REGISTRATION_ALREADY_CANCELLED
            );
        }

        if (registration.getCheckInStatus() == CheckInStatus.PRESENT
                || registration.getStatus() == RegistrationStatus.IN_PROGRESS
                || registration.getStatus() == RegistrationStatus.COMPLETED) {

            throw new AppException(
                    ErrorCode.REGISTRATION_CANNOT_BE_CANCELLED
            );
        }

        LocalDateTime now = DateTimeUtils.nowVietnam();

        ActivityDeparture departure =
                registration.getDeparture();

        if (!now.isBefore(departure.getStartDateTime())) {
            throw new AppException(
                    ErrorCode.REGISTRATION_CANNOT_BE_CANCELLED
            );
        }

        if ((registration.getPaymentConfirmedAt() != null && registration.getTotalAmount().signum() > 0)
                || paymentRepository.findByRegistrationRegistrationId(registrationId).stream().anyMatch(p ->
                p.getStatus() == PaymentStatus.PAID || p.getStatus() == PaymentStatus.REVIEW_REQUIRED)) {
            throw new AppException(ErrorCode.PAYMENT_REVIEW_REQUIRED,
                    "Paid bookings require a refund review before cancellation");
        }
        lifecycle.release(registration);
        Registration savedRegistration =
                registrationRepository.save(registration);

        return registrationMapper.toResponse(savedRegistration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BuddyResponse> getAvailableBuddyCandidates(
            UUID registrationId
    ) {
        Registration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() ->
                                new AppException(
                                        ErrorCode.REGISTRATION_NOT_FOUND
                                )
                        );

        ActivityDeparture departure =
                registration.getDeparture();

        List<UUID> busyBuddyIds =
                registrationRepository.findBusyBuddyIdsInTimeRange(
                        departure.getDepartureDate(),
                        departure.getStartTime(),
                        departure.getEndTime(),
                        RegistrationStatus.CANCELLED
                );

        List<Buddy> availableBuddies =
                buddyRepository.findByStatus(BuddyStatus.ACTIVE)
                        .stream()
                        .filter(buddy ->
                                !busyBuddyIds.contains(
                                        buddy.getBuddyId()
                                )
                        )
                        .toList();

        return buddyMapper.toResponseList(availableBuddies);
    }

    @Override
    @Transactional
    public RegistrationResponse adminAssignBuddy(
            UUID registrationId,
            UUID buddyId,
            User adminUser
    ) {
        if (adminUser == null
                || adminUser.getRole() != UserRole.ADMIN) {

            throw new AppException(
                    ErrorCode.USER_NOT_AUTHORIZED
            );
        }

        Registration registration =
                registrationRepository.findByIdWithLock(registrationId)
                        .orElseThrow(() ->
                                new AppException(
                                        ErrorCode.REGISTRATION_NOT_FOUND
                                )
                        );

        if (registration.getPaymentConfirmedAt() == null || registration.getStatus()
                != RegistrationStatus.WAITING_FOR_BUDDY) {

            throw new AppException(
                    ErrorCode.INVALID_REGISTRATION_STATUS
            );
        }

        buddyRepository.findActiveWithLock(BuddyStatus.ACTIVE);
        Buddy buddy =
                buddyRepository.findById(buddyId)
                        .orElseThrow(() ->
                                new AppException(
                                        ErrorCode.BUDDY_NOT_FOUND
                                )
                        );

        if (buddy.getStatus() != BuddyStatus.ACTIVE) throw new AppException(ErrorCode.BUDDY_NOT_FOUND);
        ActivityDeparture departure = registration.getDeparture();

        boolean isBusy =
                registrationRepository
                        .existsByBuddyAndDepartureTimeOverlap(
                                buddy,
                                departure.getDepartureDate(),
                                departure.getStartTime(),
                                departure.getEndTime(),
                                RegistrationStatus.CANCELLED
                        );

        if (isBusy) {
            throw new AppException(
                    ErrorCode.BUDDY_SCHEDULE_CONFLICT
            );
        }

        registration.setBuddy(buddy);
        registration.setBuddyAssignedAt(
                DateTimeUtils.nowVietnam()
        );
        registration.setStatus(
                RegistrationStatus.BUDDY_ASSIGNED
        );

        Registration savedRegistration =
                registrationRepository.save(registration);

        return registrationMapper.toResponse(savedRegistration);
    }


}
