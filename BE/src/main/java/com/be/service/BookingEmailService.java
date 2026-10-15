package com.be.service;

import com.be.entity.BookingEmail;
import com.be.entity.Registration;
import com.be.enums.BookingEmailStatus;
import com.be.enums.RegistrationStatus;
import com.be.repository.BookingEmailRepository;
import com.be.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingEmailService {
    private final BookingEmailRepository emails;
    private final BookingEmailComposer composer;
    private final EmailService emailService;

    @Transactional(propagation = Propagation.MANDATORY)
    public void queueConfirmation(Registration registration) {
        queue(registration, "confirmation:" + registration.getRegistrationId(), false);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void queueBuddyUpdate(Registration registration) {
        queue(registration, "buddy:" + registration.getRegistrationId() + ":" + registration.getBuddyAssignedAt(), true);
    }

    private void queue(Registration registration, String key, boolean buddyUpdate) {
        if (registration.getPaymentConfirmedAt() == null || emails.existsByNotificationKey(key)) return;
        var now = DateTimeUtils.nowVietnam();
        emails.save(BookingEmail.builder().registration(registration).notificationKey(key)
                .recipient(registration.getUser().getEmail())
                .buddyAssignedAt(buddyUpdate ? registration.getBuddyAssignedAt() : null)
                .subject(buddyUpdate ? "PHIMIUM - Cập nhật Buddy dẫn tour" : "PHIMIUM - Xác nhận đặt tour thành công")
                .htmlBody(composer.compose(registration, buddyUpdate)).createdAt(now).nextAttemptAt(now).build());
    }

    // Locking prevents concurrent workers from sending the same pending notification.
    // SMTP runs separately from the booking transaction; failures are retried by the scheduler.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendPending(UUID id) {
        BookingEmail email = emails.findByIdWithLock(id).orElse(null);
        var now = DateTimeUtils.nowVietnam();
        if (email == null || email.getStatus() != BookingEmailStatus.PENDING || email.getNextAttemptAt().isAfter(now)) return;
        Registration registration = email.getRegistration();
        boolean buddyUpdate = email.getNotificationKey().startsWith("buddy:");
        boolean staleAssignment = buddyUpdate && !Objects.equals(
                email.getBuddyAssignedAt(), registration.getBuddyAssignedAt());
        if (registration.getPaymentConfirmedAt() == null || registration.getStatus() == RegistrationStatus.CANCELLED
                || registration.getStatus() == RegistrationStatus.PAYMENT_REVIEW || staleAssignment) {
            email.setStatus(BookingEmailStatus.SKIPPED);
            return;
        }
        email.setAttempts(email.getAttempts() + 1);
        try {
            // Re-read current details so a delayed confirmation never names an unavailable Buddy.
            email.setHtmlBody(composer.compose(registration, buddyUpdate));
            emailService.sendHtmlEmail(email.getRecipient(), email.getSubject(), email.getHtmlBody());
            email.setStatus(BookingEmailStatus.SENT);
            email.setSentAt(DateTimeUtils.nowVietnam());
        } catch (RuntimeException e) {
            long retrySeconds = Math.min(3600, 60L << Math.min(6, email.getAttempts() - 1));
            email.setNextAttemptAt(DateTimeUtils.nowVietnam().plusSeconds(retrySeconds));
            log.warn("Could not send booking email {} (attempt {}); retry in {} seconds", id, email.getAttempts(), retrySeconds, e);
        }
    }
}
