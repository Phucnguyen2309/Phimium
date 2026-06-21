package com.be.service;

import com.be.dto.request.UpgradeBuddyRequest;
import com.be.dto.response.BuddyResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface BuddyService {

    BuddyResponse upgradeBuddy(
            UUID currentUserId,
            UpgradeBuddyRequest request,
            MultipartFile image
    ) throws IOException;


}
