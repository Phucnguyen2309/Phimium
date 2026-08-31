package com.be.service;

import com.be.dto.response.BuddyScheduleResponse;
import com.be.dto.response.TourMemberResponse;
import com.be.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface BuddyScheduleService {
    List<BuddyScheduleResponse> getMySchedules(User currentUser);
    List<TourMemberResponse> getTourMembers(UUID departureId, User currentUser);
}