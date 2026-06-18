package com.be.service;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.BuddyResponse;

import java.util.UUID;

public interface BuddyService {

    BuddyResponse upgradeBuddy(
            UUID currentUserId,
            UpgradeBuddyRequest request
    );


}
