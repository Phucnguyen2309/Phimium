package com.be.service;

import java.util.UUID;

public interface MatchingRequestLimiter {
    void acquire(UUID userId);
}
