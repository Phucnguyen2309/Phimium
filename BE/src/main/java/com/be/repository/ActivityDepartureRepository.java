package com.be.repository;

import com.be.entity.ActivityDeparture;
import com.be.enums.DepartureStatus;
import com.be.enums.ActivityStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ActivityDepartureRepository extends JpaRepository<ActivityDeparture, UUID>, JpaSpecificationExecutor<ActivityDeparture> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM ActivityDeparture d WHERE d.departureId = :id")
    Optional<ActivityDeparture> findByIdWithLock(@Param("id") UUID id);

    @Query("select d from ActivityDeparture d where d.departureDate = :date and d.status = :status order by d.startTime, d.departureId")
    List<ActivityDeparture> findMatchingDepartures(@Param("date") LocalDate date,
            @Param("status") DepartureStatus status, Pageable pageable);

    long countByDepartureDateAndStatus(LocalDate departureDate, DepartureStatus status);

    @Query("""
        select d from ActivityDeparture d join fetch d.activity a
        where d.departureDate >= :fromDate and d.departureDate <= :toDate
          and d.status = :status and a.status not in :excludedStatuses
        order by d.departureDate, d.startTime, d.departureId
        """)
    List<ActivityDeparture> findUpcomingMatchingDepartures(@Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate, @Param("status") DepartureStatus status,
            @Param("excludedStatuses") Set<ActivityStatus> excludedStatuses, Pageable pageable);
}
