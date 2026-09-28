package com.be.mapper;

import com.be.dto.response.AdminDashboardResponse;
import com.be.dto.response.RegistrationResponse;
import com.be.entity.Registration;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DashboardMapper {

    private final RegistrationMapper registrationMapper;

    public AdminDashboardResponse toDashboardResponse(
            BigDecimal totalRevenue,
            long totalBookings,
            long totalUsers,
            long activeBuddies,
            long pendingPayments,
            long waitingForBuddyCount,
            List<Registration> recentRegistrations
    ) {
        List<RegistrationResponse> recentResponses = (recentRegistrations == null)
                ? List.of()
                : recentRegistrations.stream()
                .map(registrationMapper::toResponse)
                .toList();

        return AdminDashboardResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalBookings(totalBookings)
                .totalUsers(totalUsers)
                .activeBuddies(activeBuddies)
                .pendingPayments(pendingPayments)
                .waitingForBuddyCount(waitingForBuddyCount)
                .recentRegistrations(recentResponses)
                .build();
    }
}