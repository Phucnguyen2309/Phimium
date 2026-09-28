package com.be.service;

import com.be.dto.request.RegistrationRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.dto.response.BuddyResponse;
import com.be.dto.response.RegistrationResponse;
import com.be.entity.User;
import com.be.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface RegistrationService {
    RegistrationResponse joinActivity(RegistrationRequest request, UUID userId);
    List<RegistrationResponse> getMyRegistrations(UUID userId);
    List<ActivityGroupResponse> getMyGroups(UUID userId);

    RegistrationResponse checkIn(
            UUID registrationId,
            User currentUser
    );

    void autoMarkAbsentAfterActivityEndTime();

    ActivityGroupResponse getGroupDetail(
            UUID groupId,
            User currentUser
    );
    RegistrationResponse cancelRegistration(UUID registrationId, User currentUser);
    List<BuddyResponse> getAvailableBuddyCandidates(UUID registrationId);
    RegistrationResponse adminAssignBuddy(UUID registrationId, UUID buddyId, User adminUser);

    Page<RegistrationResponse> getAllRegistrationsForAdmin(RegistrationStatus status, Pageable pageable);

    RegistrationResponse getRegistrationDetailForAdmin(UUID registrationId);

    RegistrationResponse manualConfirmPayment(UUID registrationId, User adminUser);
}