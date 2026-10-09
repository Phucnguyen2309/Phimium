package com.be.service.impl;

import com.be.dto.request.*;
import com.be.dto.response.BuddyResponse;
import com.be.entity.*;
import com.be.enums.*;
import com.be.exception.*;
import com.be.mapper.BuddyMapper;
import com.be.repository.*;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MatchingMetadataService {
    private final ActivityRepository activities;
    private final BuddyRepository buddies;
    private final BuddyMapper buddyMapper;

    @Transactional(readOnly = true)
    public ActivityMatchingMetadataRequest activity(UUID id) {
        Activity a = activities.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        var result = new ActivityMatchingMetadataRequest();
        result.setTags(new LinkedHashSet<>(a.getTags()));
        result.setItineraryStops(new ArrayList<>(a.getItineraryStops()));
        return result;
    }

    @Transactional
    public ActivityMatchingMetadataRequest updateActivity(UUID id, ActivityMatchingMetadataRequest request) {
        Activity a = activities.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        int previousEnd = 0;
        for (ItineraryStop stop : request.getItineraryStops()) {
            if (stop.getOffsetMinutes() < previousEnd) throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "Itinerary stops must be ordered and must not overlap");
            previousEnd = stop.getOffsetMinutes() + stop.getDurationMinutes();
        }
        for (ActivityDeparture d : a.getDepartures()) {
            if (d.getStatus() != DepartureStatus.CANCELLED && d.getStartDateTime().isAfter(DateTimeUtils.nowVietnam())
                    && previousEnd > Duration.between(d.getStartTime(), d.getEndTime()).toMinutes()) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Itinerary exceeds a departure's duration");
            }
        }
        a.setTags(new LinkedHashSet<>(request.getTags()));
        a.setItineraryStops(new ArrayList<>(request.getItineraryStops()));
        return activity(id);
    }

    @Transactional
    public BuddyResponse updateBuddy(UUID id, BuddyMatchingProfileRequest request, User user) {
        Buddy b = buddies.findByIdWithLock(id).orElseThrow(() -> new AppException(ErrorCode.BUDDY_NOT_FOUND));
        if (user == null || (user.getRole() != UserRole.ADMIN && (user.getRole() != UserRole.BUDDY
                || !b.getUser().getUserId().equals(user.getUserId())))) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }
        b.setInterests(new LinkedHashSet<>(request.getInterests()));
        b.setSkills(new LinkedHashSet<>(request.getSkills()));
        b.setLanguages(request.getLanguages().stream().map(s -> s.toUpperCase(Locale.ROOT))
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new)));
        b.setGuidingStyle(request.getGuidingStyle());
        return buddyMapper.toResponse(b);
    }
}
