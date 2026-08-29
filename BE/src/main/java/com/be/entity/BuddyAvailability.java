package com.be.entity;

import com.be.enums.AvailabilityStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

public class BuddyAvailability {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Buddy buddy;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private AvailabilityStatus status;
}
