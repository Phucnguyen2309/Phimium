package com.be.repository;

import com.be.entity.AiMatchResult;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface AiMatchResultRepository extends JpaRepository<AiMatchResult, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from AiMatchResult m where m.id = :id")
    Optional<AiMatchResult> findByIdWithLock(@Param("id") UUID id);
}
