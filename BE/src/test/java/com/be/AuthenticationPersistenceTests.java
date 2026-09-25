package com.be;

import com.be.config.PasswordEncoderConfig;
import com.be.entity.*;
import com.be.enums.*;
import com.be.exception.AppException;
import com.be.repository.*;
import com.be.service.EmailService;
import com.be.service.impl.EmailOtpServiceImpl;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.*;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {"spring.datasource.url=jdbc:h2:mem:auth;MODE=PostgreSQL",
        "spring.datasource.username=sa", "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop"})
@Import({EmailOtpServiceImpl.class, PasswordEncoderConfig.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class AuthenticationPersistenceTests {
    @Autowired UserRepository users;
    @Autowired EmailOtpRepository otps;
    @Autowired EmailOtpServiceImpl service;
    @Autowired PasswordEncoder encoder;
    @Autowired PlatformTransactionManager manager;
    @MockitoBean EmailService mail;

    @Test void incorrectOtpAttemptsCommitDespiteException() {
        String email = UUID.randomUUID() + "@gmail.com";
        TransactionTemplate tx = new TransactionTemplate(manager);
        UUID id = tx.execute(status -> {
            User user = users.saveAndFlush(User.builder().email(email).password("hash")
                    .role(UserRole.USER).status(UserStatus.ACTIVE).profileCompleted(true).build());
            otps.saveAndFlush(EmailOtp.builder().user(user).otpHash(encoder.encode("123456"))
                    .expireAt(LocalDateTime.now().plusMinutes(5)).attempts(0)
                    .lastSentAt(LocalDateTime.now()).build());
            return user.getUserId();
        });
        for (int i = 1; i <= 5; i++) {
            assertThrows(AppException.class, () -> service.verifyOtp(email, "000000"));
            int attempts = tx.execute(status -> otps.findByUser(users.findById(id).orElseThrow())
                    .orElseThrow().getAttempts());
            assertEquals(i, attempts);
        }
        assertThrows(AppException.class, () -> service.verifyOtp(email, "123456"));
        assertFalse(users.findById(id).orElseThrow().isEmailVerified());
        assertThrows(AppException.class, () -> service.resendOtp(email));
    }

    @Test void successfulVerificationPreservesProfileAndDeletesOtp() {
        String email = UUID.randomUUID() + "@gmail.com";
        TransactionTemplate tx = new TransactionTemplate(manager);
        UUID id = tx.execute(status -> {
            User user = users.saveAndFlush(User.builder().email(email).role(UserRole.USER)
                    .status(UserStatus.ACTIVE).profileCompleted(true).build());
            otps.saveAndFlush(EmailOtp.builder().user(user).otpHash(encoder.encode("123456"))
                    .expireAt(LocalDateTime.now().plusMinutes(5)).attempts(0).build());
            return user.getUserId();
        });
        service.verifyOtp(email, "123456");
        User saved = users.findById(id).orElseThrow();
        assertTrue(saved.isEmailVerified()); assertTrue(saved.isProfileCompleted());
        assertEquals(Boolean.TRUE, tx.execute(status -> otps.findByUser(saved).isEmpty()));
    }
}
