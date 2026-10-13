package com.be.repository;

import com.be.entity.Activity;
import com.be.enums.ActivityStatus;
import com.be.enums.TourType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Activity a where a.id = :id")
    Optional<Activity> findByIdWithLock(@Param("id") UUID id);

    List<Activity> findByStatus(ActivityStatus status);

    List<Activity> findByActivityType(TourType activityType);

    List<Activity> findByStatusAndActivityType(ActivityStatus status, TourType activityType);

}
