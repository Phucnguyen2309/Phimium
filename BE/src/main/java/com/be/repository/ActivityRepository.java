package com.be.repository;

import com.be.entity.Activity;
import com.be.entity.Buddy;
import com.be.enums.ActivityStatus;
import com.be.enums.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    List<Activity> findByStatus(ActivityStatus status);

    List<Activity> findByActivityType(ActivityType activityType);

    List<Activity> findByStatusAndActivityType(ActivityStatus status, ActivityType activityType);

    List<Activity> findByHost_BuddyId(UUID hostId);

}
