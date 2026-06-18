package com.be.repository;

import com.be.entity.User;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findById(UUID id);

    List<User> findByRole(UserRole role);

    List<User> findByStatus(UserStatus status);
}
