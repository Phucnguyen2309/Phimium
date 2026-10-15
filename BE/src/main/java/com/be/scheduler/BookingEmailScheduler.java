package com.be.scheduler;

import com.be.enums.BookingEmailStatus;
import com.be.repository.BookingEmailRepository;
import com.be.service.BookingEmailService;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEmailScheduler {
    private final BookingEmailRepository emails;
    private final BookingEmailService service;

    @Scheduled(scheduler = "bookingEmailTaskScheduler", fixedDelayString = "${booking.mail.scan-ms:10000}",
            initialDelayString = "${booking.mail.scan-ms:10000}")
    public void sendPendingEmails() {
        for (var email : emails.findTop20ByStatusAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAsc(
                BookingEmailStatus.PENDING, DateTimeUtils.nowVietnam())) {
            try {
                service.sendPending(email.getId());
            } catch (RuntimeException e) {
                log.warn("Could not process booking email {}; will retry", email.getId(), e);
            }
        }
    }
}
