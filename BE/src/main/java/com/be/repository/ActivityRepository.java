package com.be.repository;

import com.be.entity.Activity;
import com.be.enums.ActivityStatus;
import com.be.enums.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    List<Activity> findByStatus(ActivityStatus status);

    List<Activity> findByActivityType(ActivityType activityType);

    List<Activity> findByStatusAndActivityType(ActivityStatus status, ActivityType activityType);
}
