package com.be.service;

import com.be.entity.Buddy;
import com.be.entity.Registration;

import java.time.LocalDateTime;
import java.util.UUID;

public interface BuddyMatchingService {
    Buddy findAndAssignBuddy(Registration registration);
    java.util.List<Buddy> validateMatchedBuddies(com.be.entity.AiMatchResult result,
            com.be.entity.ActivityDeparture departure, UUID excludingRegistrationId);
    boolean hasScheduleConflict(UUID buddyId, LocalDateTime newStart, LocalDateTime newEnd);
}