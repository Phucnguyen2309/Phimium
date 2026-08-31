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


    Optional<Buddy> findByUser_UserId(UUID userId);


    boolean existsByUser_UserId(UUID userId);
}
