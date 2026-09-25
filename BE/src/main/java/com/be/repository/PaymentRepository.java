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

    @org.springframework.data.jpa.repository.Query("select p.registration.registrationId from Payment p where p.invoiceNumber = :invoice")
    Optional<UUID> findRegistrationIdByInvoiceNumber(@org.springframework.data.repository.query.Param("invoice") String invoice);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from Payment p where p.invoiceNumber = :invoice")
    Optional<Payment> findByInvoiceNumberWithLock(@org.springframework.data.repository.query.Param("invoice") String invoice);
    List<Payment> findByRegistrationRegistrationId(UUID registrationId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from Payment p where p.id = :id")
    Optional<Payment> findByIdWithLock(@org.springframework.data.repository.query.Param("id") UUID id);

    Optional<Payment> findByProviderTransactionId(String providerTransactionId);

    Page<Payment> findByRegistrationUserUserId(UUID userId, Pageable pageable);

    Optional<Payment> findByIdAndRegistrationUserUserId(UUID paymentId, UUID userId);

    boolean existsByRegistrationRegistrationIdAndStatus(
            UUID registrationId,
            PaymentStatus status
    );








}
