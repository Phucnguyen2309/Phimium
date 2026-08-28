package com.be.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

public class AdditionalService {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID serviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    private Activity activity;

    private String name;

    private BigDecimal pricePerPerson;

    private Boolean active;
}
