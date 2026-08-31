package com.be.repository;

import com.be.entity.ActivityDeparture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityDepartureRepository extends JpaRepository<ActivityDeparture, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM ActivityDeparture d WHERE d.departureId = :id")
    Optional<ActivityDeparture> findByIdWithLock(@Param("id") UUID id);
}