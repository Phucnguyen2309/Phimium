package com.be.repository;

import com.be.entity.*;
import com.be.enums.CheckInStatus;
import com.be.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Registration> {

    interface DepartureCount {
        UUID getDepartureId();
        RegistrationStatus getStatus();
        Long getBookings();
        Long getAdults();
        Long getChildren();
    }

    @Query("""
        select r.departure.departureId as departureId, r.status as status,
               count(r) as bookings, sum(r.adultCount) as adults, sum(r.childCount) as children
        from Registration r where r.departure.departureId in :ids
        group by r.departure.departureId, r.status
        """)
    List<DepartureCount> countByDepartures(@Param("ids") List<UUID> ids);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Registration r where r.registrationId = :id")
    java.util.Optional<Registration> findByIdWithLock(@Param("id") UUID id);

    List<Registration> findByStatusAndPaymentExpiresAtLessThanEqual(RegistrationStatus status, java.time.LocalDateTime now);
    List<Registration> findByDepartureDepartureId(UUID departureId);
    List<Registration> findByUser(User user);
    java.util.Optional<Registration> findByMatchResult_Id(UUID matchResultId);
    List<Registration> findByDepartureActivity(Activity activity);

    List<Registration> findByGroup(ActivityGroup group);

    List<Registration> findByStatus(RegistrationStatus status);

    @Query("""
    SELECT r FROM Registration r
    WHERE r.checkInStatus = :checkInStatus
      AND (r.departure.departureDate < :today
           OR (r.departure.departureDate = :today AND r.departure.endTime < :now))
    """)
    List<Registration> findByCheckInStatusAndDepartureEndedBefore(
            @Param("checkInStatus") CheckInStatus checkInStatus,
            @Param("today") LocalDate today,
            @Param("now") LocalTime now
    );

    boolean existsByGroupGroupIdAndUserUserId(
            UUID groupId,
            UUID userId
    );
    @Query("SELECT DISTINCT r FROM Registration r " +
            "LEFT JOIN r.buddies b " +
            "WHERE (r.buddy.buddyId = :buddyId OR b.buddyId = :buddyId) " +
            "AND r.status IN :statuses")
    List<Registration> findByBuddy_BuddyIdAndStatusIn(
            @Param("buddyId") UUID buddyId,
            @Param("statuses") List<RegistrationStatus> statuses
    );

    @Query("""
    SELECT DISTINCT COALESCE(b.buddyId, r.buddy.buddyId) 
    FROM Registration r 
    LEFT JOIN r.buddies b
    WHERE (b.buddyId IS NOT NULL OR r.buddy.buddyId IS NOT NULL) 
      AND r.status != :cancelledStatus 
      AND r.departure.departureDate = :departureDate
      AND (r.status != :pendingStatus OR r.paymentExpiresAt > :now)
      AND r.departure.startTime < :endTime
      AND r.departure.endTime > :startTime
""")
    List<UUID> findBusyBuddyIdsInTimeRangeAt(
            @Param("departureDate") LocalDate departureDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("cancelledStatus") RegistrationStatus cancelledStatus,
            @Param("pendingStatus") RegistrationStatus pendingStatus,
            @Param("now") java.time.LocalDateTime now);

    default List<UUID> findBusyBuddyIdsInTimeRange(LocalDate date, LocalTime start, LocalTime end, RegistrationStatus cancelled) {
        return findBusyBuddyIdsInTimeRangeAt(date, start, end, cancelled, RegistrationStatus.PENDING_PAYMENT,
                com.be.util.DateTimeUtils.nowVietnam());
    }

    @Query("""
    SELECT COUNT(r) > 0 
    FROM Registration r 
    LEFT JOIN r.buddies b
    WHERE (r.buddy = :buddy OR b = :buddy) 
      AND r.status != :cancelledStatus 
      AND r.departure.departureDate = :departureDate
      AND (r.status != :pendingStatus OR r.paymentExpiresAt > :now)
      AND r.departure.startTime < :endTime
      AND r.departure.endTime > :startTime
""")
    boolean existsByBuddyAndDepartureTimeOverlapAt(
            @Param("buddy") Buddy buddy,
            @Param("departureDate") LocalDate departureDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("cancelledStatus") RegistrationStatus cancelledStatus,
            @Param("pendingStatus") RegistrationStatus pendingStatus,
            @Param("now") java.time.LocalDateTime now);

    default boolean existsByBuddyAndDepartureTimeOverlap(Buddy buddy, LocalDate date, LocalTime start,
                                                        LocalTime end, RegistrationStatus cancelled) {
        return existsByBuddyAndDepartureTimeOverlapAt(buddy, date, start, end, cancelled,
                RegistrationStatus.PENDING_PAYMENT, com.be.util.DateTimeUtils.nowVietnam());
    }

    // Lấy danh sách các đơn đã gán cho Buddy (bao gồm đang phân công, đang chạy, và đã hoàn thành)
    @Query("SELECT DISTINCT r FROM Registration r " +
            "LEFT JOIN r.buddies b " +
            "WHERE (r.buddy.buddyId = :buddyId OR b.buddyId = :buddyId) " +
            "AND r.status IN (com.be.enums.RegistrationStatus.BUDDY_ASSIGNED, com.be.enums.RegistrationStatus.CONFIRMED, com.be.enums.RegistrationStatus.IN_PROGRESS, com.be.enums.RegistrationStatus.COMPLETED)")
    List<Registration> findByBuddyId(@Param("buddyId") UUID buddyId);

    // Lấy danh sách khách trong ca của Buddy
    @Query("SELECT DISTINCT r FROM Registration r " +
            "LEFT JOIN r.buddies b " +
            "WHERE (r.buddy.buddyId = :buddyId OR b.buddyId = :buddyId) " +
            "AND r.departure.departureId = :departureId " +
            "AND r.status IN (com.be.enums.RegistrationStatus.BUDDY_ASSIGNED, com.be.enums.RegistrationStatus.CONFIRMED, com.be.enums.RegistrationStatus.IN_PROGRESS, com.be.enums.RegistrationStatus.COMPLETED)")
    List<Registration> findByBuddyIdAndDepartureId(
            @Param("buddyId") UUID buddyId,
            @Param("departureId") UUID departureId
    );

    Page<Registration> findByStatus(RegistrationStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.totalAmount), 0) FROM Registration r " +
            "WHERE r.status IN ('CONFIRMED', 'BUDDY_ASSIGNED', 'IN_PROGRESS', 'COMPLETED')")
    BigDecimal calculateTotalRevenue();

    long countByStatus(RegistrationStatus status);

    List<Registration> findTop5ByOrderByRegisteredAtDesc();

    @Query("SELECT DISTINCT r FROM Registration r " +
            "LEFT JOIN r.buddies b " +
            "WHERE (r.buddy.buddyId = :buddyId OR b.buddyId = :buddyId) " +
            "AND r.status = :status")
    List<Registration> findByBuddy_BuddyIdAndStatus(
            @Param("buddyId") UUID buddyId,
            @Param("status") RegistrationStatus status
    );
}
