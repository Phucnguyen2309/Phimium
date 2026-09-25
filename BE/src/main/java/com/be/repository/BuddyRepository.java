package com.be.repository;

import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.enums.BuddyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BuddyRepository extends JpaRepository<Buddy, UUID> {

    List<Buddy> findByStatus(BuddyStatus status);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select b from Buddy b where b.status = :status order by b.buddyId")
    List<Buddy> findActiveWithLock(@org.springframework.data.repository.query.Param("status") BuddyStatus status);


    Optional<Buddy> findByUser_UserId(UUID userId);


    boolean existsByUser_UserId(UUID userId);
}
