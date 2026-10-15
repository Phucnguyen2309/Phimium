package com.be.repository;

import com.be.entity.BookingEmail;
import com.be.enums.BookingEmailStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingEmailRepository extends JpaRepository<BookingEmail, UUID> {
    boolean existsByNotificationKey(String notificationKey);

    List<BookingEmail> findTop20ByStatusAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAsc(
            BookingEmailStatus status, LocalDateTime now);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from BookingEmail e where e.id = :id")
    Optional<BookingEmail> findByIdWithLock(@Param("id") UUID id);
}
