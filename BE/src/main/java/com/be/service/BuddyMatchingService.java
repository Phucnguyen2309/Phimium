package com.be.service;

import com.be.entity.Buddy;
import com.be.entity.Registration;

import java.time.LocalDateTime;
import java.util.UUID;

public interface BuddyMatchingService {
    Buddy findAndAssignBuddy(Registration registration);
    boolean hasScheduleConflict(UUID buddyId, LocalDateTime newStart, LocalDateTime newEnd);
}