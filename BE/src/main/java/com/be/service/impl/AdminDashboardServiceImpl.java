package com.be.service.impl;

import com.be.dto.response.AdminDashboardResponse;
import com.be.entity.Registration;
import com.be.enums.BuddyStatus;
import com.be.enums.PaymentStatus;
import com.be.enums.RegistrationStatus;
import com.be.enums.UserRole;
import com.be.mapper.DashboardMapper;
import com.be.repository.BuddyRepository;
import com.be.repository.PaymentRepository;
import com.be.repository.RegistrationRepository;
import com.be.repository.UserRepository;
import com.be.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final BuddyRepository buddyRepository;
    private final DashboardMapper dashboardMapper;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardSummary() {
        BigDecimal totalRevenue = paymentRepository.sumAmountByStatus(PaymentStatus.PAID);
        long totalBookings = registrationRepository.count();
        long totalUsers = userRepository.countByRole(UserRole.USER);
        long activeBuddies = buddyRepository.countByStatus(BuddyStatus.ACTIVE);
        long pendingPayments = registrationRepository.countByStatus(RegistrationStatus.PENDING_PAYMENT);
        long waitingForBuddy = registrationRepository.countByStatus(RegistrationStatus.WAITING_FOR_BUDDY);
        List<Registration> recentRegistrations = registrationRepository.findTop5ByOrderByRegisteredAtDesc();

        return dashboardMapper.toDashboardResponse(
                totalRevenue,
                totalBookings,
                totalUsers,
                activeBuddies,
                pendingPayments,
                waitingForBuddy,
                recentRegistrations
        );
    }
}