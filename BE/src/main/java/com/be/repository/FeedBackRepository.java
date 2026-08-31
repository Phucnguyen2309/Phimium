package com.be.repository;

import com.be.entity.FeedBack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedBackRepository extends JpaRepository<FeedBack, UUID> {

    boolean existsByRegistration_RegistrationId(UUID registrationId);

    Optional<FeedBack> findByRegistration_RegistrationId(UUID registrationId);

    List<FeedBack> findByReviewer_UserIdOrderByCreatedAtDesc(UUID userId);

    List<FeedBack> findByBuddy_BuddyIdOrderByCreatedAtDesc(UUID buddyId);
    @Query("SELECT AVG(f.buddyRating) FROM FeedBack f WHERE f.buddy.buddyId = :buddyId AND f.buddyRating IS NOT NULL")
    Double calculateAverageBuddyRating(@Param("buddyId") UUID buddyId);

    @Query("SELECT COUNT(f) FROM FeedBack f WHERE f.buddy.buddyId = :buddyId AND f.buddyRating IS NOT NULL")
    Integer countBuddyReviews(@Param("buddyId") UUID buddyId);

}