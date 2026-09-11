package com.be.repository;


import com.be.entity.Payment;
import com.be.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByInvoiceNumber(String invoiceNumber);

    Optional<Payment> findByProviderTransactionId(String providerTransactionId);

    Page<Payment> findByRegistrationUserUserId(UUID userId, Pageable pageable);

    Optional<Payment> findByIdAndRegistrationUserUserId(UUID paymentId, UUID userId);

    boolean existsByRegistrationRegistrationIdAndStatus(
            UUID registrationId,
            PaymentStatus status
    );








}
