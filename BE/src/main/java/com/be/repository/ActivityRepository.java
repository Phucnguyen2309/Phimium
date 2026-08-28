package com.be.repository;

import com.be.entity.Activity;
import com.be.enums.ActivityStatus;
import com.be.enums.TourType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    List<Activity> findByStatus(ActivityStatus status);

    List<Activity> findByActivityType(TourType activityType);

    List<Activity> findByStatusAndActivityType(ActivityStatus status, TourType activityType);

    List<Activity> findByHost_BuddyId(UUID hostId);

    List<Activity> findByStatusInAndStartTimeAfterAndStartTimeLessThanEqual(
            Collection<ActivityStatus> statuses,
            LocalDateTime thresholdTime,
            LocalDateTime now
    );

    List<Activity> findByStatusInAndStartTimeLessThanEqualAndEndTimeAfter(
            Collection<ActivityStatus> statuses,
            LocalDateTime nowStart,
            LocalDateTime nowEnd
    );

    List<Activity> findByStatusInAndEndTimeLessThanEqual(
            Collection<ActivityStatus> statuses,
            LocalDateTime now
    );






}
