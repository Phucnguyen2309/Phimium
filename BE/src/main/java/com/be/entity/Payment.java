package com.be.entity;

import com.be.enums.PaymentMethod;
import com.be.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="Payment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id",nullable = false)
    private Registration registration;

    @Column(name = "invoice_number",nullable = false,unique = true)
    private String invoiceNumber;

    @Column(name = "currency",nullable = false)
    private String currency;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String providerOrderId;

    @Column(unique = true)
    private String providerTransactionId;

    private String provider;

    private String description;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updateAt;

    private LocalDateTime paidAt;

    @PrePersist
    public void prePersist()
    {
        createdAt = LocalDateTime.now();
        updateAt = LocalDateTime.now();

        if(status == null){
          status = PaymentStatus.PENDING;
        }
        if(currency == null){
          currency = "VND";
        }
    }
    @PreUpdate
    public void preUpdate()
    {
        updateAt = LocalDateTime.now();
    }
}
