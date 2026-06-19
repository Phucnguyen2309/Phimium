package com.be.repository;

import com.be.entity.Buddy;
import com.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BuddyRepository extends JpaRepository<Buddy, UUID> {

    Optional<Buddy> findByUserUserId(UUID userId);

    boolean existsByUserUserId(UUID userId);
}
