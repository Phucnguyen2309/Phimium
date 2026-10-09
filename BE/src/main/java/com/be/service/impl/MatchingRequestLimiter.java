package com.be.service.impl;

import com.be.config.MatchingProperties;
import com.be.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
@RequiredArgsConstructor
public class MatchingRequestLimiter {
    private final MatchingProperties properties;
    private final Map<UUID, Window> windows = new HashMap<>();
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
