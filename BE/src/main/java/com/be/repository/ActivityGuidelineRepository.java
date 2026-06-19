package com.be.repository;

import com.be.entity.Activity;
import com.be.entity.ActivityGuideline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityGuidelineRepository extends JpaRepository<ActivityGuideline, UUID> {
    ActivityGuideline findFirstByOrderByUpdatedAtDesc();
    Optional<ActivityGuideline> findByActivity(Activity activity);
}