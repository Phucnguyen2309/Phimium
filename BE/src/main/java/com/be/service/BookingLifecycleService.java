package com.be.service;

import com.be.entity.Registration;

import java.util.UUID;

public interface BookingLifecycleService {
    boolean isExpired(Registration registration);
    boolean canFulfill(Registration registration);
    void expire(UUID registrationId);
    void release(Registration registration);
    void confirm(Registration registration);
}
