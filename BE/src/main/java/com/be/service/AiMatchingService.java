package com.be.service;

import com.be.dto.request.AiMatchRequest;
import com.be.dto.response.AiMatchResponse;
import com.be.entity.User;

public interface AiMatchingService {
    AiMatchResponse match(AiMatchRequest request, User user);
}
