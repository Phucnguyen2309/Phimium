package com.be;

import com.be.controller.AdminBookingController;
import com.be.dto.request.DepartureCapacityRequest;
import com.be.service.AdminBookingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringJUnitConfig(AdminBookingSecurityTests.Config.class)
class AdminBookingSecurityTests {
    @Configuration
    @EnableMethodSecurity
    static class Config {
        @Bean AdminBookingService service() { return mock(AdminBookingService.class); }
        @Bean AdminBookingController controller(AdminBookingService service) { return new AdminBookingController(service); }
    }
    @Autowired AdminBookingController controller;
    @AfterEach void cleanup() { SecurityContextHolder.clearContext(); }
    void role(String role) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "test", "unused", List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
    @Test void userAndBuddyCannotReadContactsOrChangeDeparture() {
        for (String role : List.of("USER", "BUDDY")) {
            role(role);
            assertThrows(AccessDeniedException.class, () -> controller.registrations(null, null, null, 0, 20));
            assertThrows(AccessDeniedException.class, () -> controller.registration(UUID.randomUUID()));
            assertThrows(AccessDeniedException.class, () -> controller.departures(null, null, null, null, 0, 20));
            assertThrows(AccessDeniedException.class, () -> controller.departure(UUID.randomUUID()));
            assertThrows(AccessDeniedException.class, () -> controller.create(UUID.randomUUID(), null));
            assertThrows(AccessDeniedException.class, () -> controller.capacity(UUID.randomUUID(), new DepartureCapacityRequest(10)));
        }
    }
    @Test void adminCanAccessManagement() {
        role("ADMIN");
        assertDoesNotThrow(() -> controller.registrations(null, null, null, 0, 20));
        assertDoesNotThrow(() -> controller.departure(UUID.randomUUID()));
        assertDoesNotThrow(() -> controller.capacity(UUID.randomUUID(), new DepartureCapacityRequest(10)));
    }
}
