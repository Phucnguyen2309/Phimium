package com.be.dto.response;

import java.util.UUID;

public record AdminRegistrationResponse(RegistrationResponse booking, Customer customer) {
    public record Customer(UUID userId, String fullName, String email, String phone) {}
}
