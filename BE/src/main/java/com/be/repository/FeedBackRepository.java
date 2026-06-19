package com.be.repository;

import com.be.entity.FeedBack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeedBackRepository extends JpaRepository<FeedBack, UUID> {

    boolean existsByRegistrationRegistrationId(UUID registrationId);

    Optional<FeedBack> findByRegistrationRegistrationId(UUID registrationId);

    List<FeedBack> findByReviewerUserIdOrderByCreatedAtDesc(UUID userId);

    List<FeedBack> findByBuddyBuddyIdOrderByCreatedAtDesc(UUID buddyId);
}