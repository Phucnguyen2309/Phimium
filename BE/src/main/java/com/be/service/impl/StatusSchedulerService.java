package com.be.service.impl;

import com.be.entity.Activity;
import com.be.entity.ActivityGroup;
import com.be.enums.ActivityStatus;
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

    private void updateActivitiesToUpcoming(
            LocalDateTime now,
            LocalDateTime thresholdTime
    ) {
        List<Activity> activities =
                activityRepository
                        .findByStatusInAndStartTimeAfterAndStartTimeLessThanEqual(
                                List.of(
                                        ActivityStatus.PUBLISHED
                                ),
                                now,
                                thresholdTime
                        );

        for (Activity activity : activities) {
            activity.setStatus(ActivityStatus.UPCOMING);
        }

        activityRepository.saveAll(activities);
    }
    @Transactional
    public void updateActivityAndGroupStatus() {
        LocalDateTime now = DateTimeUtils.nowVietnam();
        LocalDateTime thresholdTime = now.plusDays(3);

        updateActivitiesToUpcoming(now, thresholdTime);

        updateActivitiesToOngoing(now);
        updateGroupsToOngoing(now);

        updateActivitiesToCompleted(now);
        updateGroupsToCompleted(now);
    }

    private void updateActivitiesToOngoing(LocalDateTime now) {
        List<Activity> activities =
                activityRepository
                        .findByStatusInAndStartTimeLessThanEqualAndEndTimeAfter(
                                List.of(
                                        ActivityStatus.PUBLISHED,
                                        ActivityStatus.UPCOMING
                                ),
                                now,
                                now
                        );

        for (Activity activity : activities) {
            activity.setStatus(ActivityStatus.ONGOING);
        }

        activityRepository.saveAll(activities);
    }

    private void updateGroupsToOngoing(LocalDateTime now) {
        List<ActivityGroup> groups =
                activityGroupRepository
                        .findByStatusAndActivityStartTimeLessThanEqualAndActivityEndTimeAfter(
                                GroupStatus.READY,
                                now,
                                now
                        );

        for (ActivityGroup group : groups) {
            group.setStatus(GroupStatus.ONGOING);
        }

        activityGroupRepository.saveAll(groups);
    }

    private void updateActivitiesToCompleted(LocalDateTime now) {
        List<Activity> activities =
                activityRepository
                        .findByStatusInAndEndTimeLessThanEqual(
                                List.of(
                                        ActivityStatus.PUBLISHED,
                                        ActivityStatus.UPCOMING,
                                        ActivityStatus.ONGOING
                                ),
                                now
                        );

        for (Activity activity : activities) {
            activity.setStatus(ActivityStatus.COMPLETED);
        }

        activityRepository.saveAll(activities);
    }

    private void updateGroupsToCompleted(LocalDateTime now) {
        List<ActivityGroup> groups =
                activityGroupRepository
                        .findByStatusInAndActivityEndTimeLessThanEqual(
                                List.of(
                                        GroupStatus.READY,
                                        GroupStatus.ONGOING
                                ),
                                now
                        );

        for (ActivityGroup group : groups) {
            group.setStatus(GroupStatus.COMPLETED);
        }

        activityGroupRepository.saveAll(groups);
    }


}