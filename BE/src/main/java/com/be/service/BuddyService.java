package com.be.service;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.BuddyResponse;
import com.be.enums.BuddyStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface BuddyService {

    BuddyResponse upgradeBuddy(
            UUID currentUserId,
            UpgradeBuddyRequest request,
            MultipartFile image
    ) throws IOException;

    List<BuddyResponse> getAllBuddies(BuddyStatus status);

    BuddyResponse updateBuddyStatus(UUID buddyId, BuddyStatus status);

}
