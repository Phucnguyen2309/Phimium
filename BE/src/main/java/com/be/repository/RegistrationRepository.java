package com.be.repository;

import com.be.entity.*;
import com.be.enums.CheckInStatus;
import com.be.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    List<Registration> findByUser(User user);
    List<Registration> findByDepartureActivity(Activity activity);

    List<Registration> findByGroup(ActivityGroup group);

    List<Registration> findByStatus(RegistrationStatus status);

    List<Registration> findByCheckInStatusAndDepartureEndTimeBefore(
            CheckInStatus checkInStatus,
            LocalDateTime now
    );

    boolean existsByGroupGroupIdAndUserUserId(
            UUID groupId,
            UUID userId
    );
    List<Registration> findByBuddy_BuddyIdAndStatusIn(UUID buddyId, List<RegistrationStatus> statuses);
    @Query("""
    SELECT DISTINCT r.buddy.buddyId 
    FROM Registration r 
    WHERE r.buddy IS NOT NULL 
      AND r.status != :cancelledStatus 
      AND r.departure.startTime < :endTime 
      AND r.departure.endTime > :startTime
""")
    List<UUID> findBusyBuddyIdsInTimeRange(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cancelledStatus") RegistrationStatus cancelledStatus
    );

    @Query("""
    SELECT COUNT(r) > 0 
    FROM Registration r 
    WHERE r.buddy = :buddy 
      AND r.status != :cancelledStatus 
      AND r.departure.startTime < :endTime 
      AND r.departure.endTime > :startTime
""")
    boolean existsByBuddyAndDepartureTimeOverlap(
            @Param("buddy") Buddy buddy,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cancelledStatus") RegistrationStatus cancelledStatus
    );

    // Lấy danh sách các đơn đã gán cho Buddy
    @Query("SELECT r FROM Registration r " +
            "WHERE r.buddy.buddyId = :buddyId " +
            "AND r.status = com.be.enums.RegistrationStatus.BUDDY_ASSIGNED " +
            "ORDER BY r.departure.startTime ASC")
    List<Registration> findByBuddyId(@Param("buddyId") UUID buddyId);
    // Lấy danh sách khách trong ca của Buddy
    @Query("SELECT r FROM Registration r " +
            "WHERE r.buddy.buddyId = :buddyId " +
            "AND r.departure.departureId = :departureId " +
            "AND r.status = com.be.enums.RegistrationStatus.BUDDY_ASSIGNED")
    List<Registration> findByBuddyIdAndDepartureId(
            @Param("buddyId") UUID buddyId,
            @Param("departureId") UUID departureId
    );
}