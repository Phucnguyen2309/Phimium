package com.be.service.impl;

import com.be.config.MatchingProperties;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.MatchingRequestLimiter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MatchingRequestLimiterImpl implements MatchingRequestLimiter {
    private final MatchingProperties properties;
    private final Map<UUID, Window> windows = new HashMap<>();
    @Override
    public synchronized void acquire(UUID userId) {
        long now = System.nanoTime();
        windows.entrySet().removeIf(e -> now - e.getValue().start >= 60_000_000_000L);
        Window window = windows.get(userId);
        if (window == null) {
            if (windows.size() >= 10000) throw new AppException(ErrorCode.AI_RATE_LIMITED);
            window = new Window(now);
            windows.put(userId, window);
        }
        if (window.count >= properties.getRequestsPerMinute()) throw new AppException(ErrorCode.AI_RATE_LIMITED);
        window.count++;
    }
    private static class Window {
        final long start;
        int count;
        Window(long start) { this.start = start; }
    }
}
