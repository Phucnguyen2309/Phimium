package com.be.repository;

import com.be.entity.EmailOtp;
import com.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, UUID> {

    Optional<EmailOtp> findByUser(User user);

    void deleteByUser(User user);
}
