package com.be.scheduler;

import com.be.enums.RegistrationStatus;
import com.be.repository.RegistrationRepository;
import com.be.service.BookingLifecycleService;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingExpiryScheduler {
    private final RegistrationRepository registrations;
    private final BookingLifecycleService lifecycle;

    @Scheduled(fixedDelayString = "${booking.expiry-scan-ms:30000}")
    public void expireHolds() {
        for (var registration : registrations.findByStatusAndPaymentExpiresAtLessThanEqual(
                RegistrationStatus.PENDING_PAYMENT, DateTimeUtils.nowVietnam())) {
            try {
                lifecycle.expire(registration.getRegistrationId());
            } catch (RuntimeException e) {
                log.warn("Could not expire booking {}; will retry", registration.getRegistrationId(), e);
            }
        }
    }
}
