package com.be.service.impl;

import com.be.entity.ActivityGroup;
import com.be.enums.GroupStatus;
import com.be.repository.ActivityGroupRepository;
import com.be.repository.ActivityRepository;
import com.be.util.DateTimeUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatusSchedulerService {

    private final ActivityRepository activityRepository;
    private final ActivityGroupRepository activityGroupRepository;

    @Transactional
    public void updateActivityAndGroupStatus() {
        LocalDateTime now = DateTimeUtils.nowVietnam();
//         updateActivitiesToUpcoming(now, now.plusDays(3));
//         updateActivitiesToOngoing(now);
//
//        updateGroupsToOngoing(now);
//
//         updateActivitiesToCompleted(now);
//        updateGroupsToCompleted(now);
    }

//    private void updateGroupsToOngoing(LocalDateTime now) {
//        List<ActivityGroup> groups =
//                activityGroupRepository
//                        .findByStatusAndActivityStartTimeLessThanEqualAndActivityEndTimeAfter(
//                                GroupStatus.READY,
//                                now,
//                                now
//                        );
//
//        for (ActivityGroup group : groups) {
//            group.setStatus(GroupStatus.ONGOING);
//        }
//
//        activityGroupRepository.saveAll(groups);
//    }
//
//    private void updateGroupsToCompleted(LocalDateTime now) {
//        List<ActivityGroup> groups =
//                activityGroupRepository
//                        .findByStatusInAndActivityEndTimeLessThanEqual(
//                                List.of(
//                                        GroupStatus.READY,
//                                        GroupStatus.ONGOING
//                                ),
//                                now
//                        );
//
//        for (ActivityGroup group : groups) {
//            group.setStatus(GroupStatus.COMPLETED);
//        }
//
//        activityGroupRepository.saveAll(groups);
//    }
}