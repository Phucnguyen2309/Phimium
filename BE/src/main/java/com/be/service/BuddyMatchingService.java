package com.be.service;

import com.be.entity.ActivityDeparture;
import com.be.entity.AiMatchResult;
import com.be.entity.Buddy;
import com.be.entity.Registration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface BuddyMatchingService {
    Buddy findAndAssignBuddy(Registration registration);
    List<Buddy> validateMatchedBuddies(AiMatchResult result,
            ActivityDeparture departure, UUID excludingRegistrationId);
    boolean hasScheduleConflict(UUID buddyId, LocalDateTime newStart, LocalDateTime newEnd);
}