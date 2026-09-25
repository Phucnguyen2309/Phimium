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

    Optional<User> findByGoogleSub(String googleSub);
    boolean existsByGoogleSub(String googleSub);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndUserIdNot(String phone, UUID userId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from User u where u.userId = :id")
    Optional<User> findLockedById(@org.springframework.data.repository.query.Param("id") UUID id);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from User u where u.email = :email")
    Optional<User> findLockedByEmail(@org.springframework.data.repository.query.Param("email") String email);

    Optional<User> findById(UUID id);

    List<User> findByRole(UserRole role);

    List<User> findByStatus(UserStatus status);
}
