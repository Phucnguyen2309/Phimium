package com.be.repository;

import com.be.entity.AiMatchResult;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AiMatchResultRepository extends JpaRepository<AiMatchResult, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from AiMatchResult m where m.id = :id")
    Optional<AiMatchResult> findByIdWithLock(@Param("id") UUID id);
}
