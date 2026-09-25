package com.be;

import com.be.config.JwtService;
import com.be.dto.request.*;
import com.be.entity.*;
import com.be.enums.*;
import com.be.exception.*;
import com.be.repository.*;
import com.be.service.*;
import com.be.service.impl.*;
import org.junit.jupiter.api.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthenticationTests {
    UserRepository users;
    EmailOtpService otp;
    JwtService jwt;
    AuthServiceImpl auth;
    GoogleTokenVerifier verifier;
    GoogleAuthServiceImpl google;
    final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @BeforeEach void setup() {
        users = mock(UserRepository.class);
        otp = mock(EmailOtpService.class);
        jwt = new JwtService(mock(BuddyRepository.class));
        ReflectionTestUtils.setField(jwt, "secretkey", Base64.getEncoder().encodeToString(new byte[32]));
        ReflectionTestUtils.setField(jwt, "expireMs", 86400000L);
        ReflectionTestUtils.setField(jwt, "refreshExpireMs", 604800000L);
        var tokens = new AuthTokenService(jwt);
        auth = new AuthServiceImpl(users, encoder, jwt, otp, tokens);
        verifier = mock(GoogleTokenVerifier.class);
        google = new GoogleAuthServiceImpl(verifier, users, jwt, tokens);
        when(users.saveAndFlush(any())).thenAnswer(inv -> {
            User user = inv.getArgument(0);
            if (user.getUserId() == null) user.setUserId(UUID.randomUUID());
            user.prePersist();
            return user;
        });
    }

    User user(boolean complete) {
        return User.builder().userId(UUID.randomUUID()).email("abc@gmail.com")
                .password(encoder.encode("Password123!")).role(UserRole.USER).status(UserStatus.ACTIVE)
                .profileCompleted(complete).emailVerified(true).build();
    }

    void claims() {
        when(verifier.verify("credential")).thenReturn(
                new GoogleTokenVerifier.VerifiedGoogleUser("google-sub", " ABC@gmail.com ", "Google Name"));
    }

    void error(ErrorCode code, org.junit.jupiter.api.function.Executable action) {
        assertEquals(code, assertThrows(AppException.class, action).getErrorCode());
    }

    @Test void localRegistration() {
        var request = new RegisterRequest();
        request.setEmail(" ABC@gmail.com "); request.setPassword("Password123!");
        request.setFullName(" Nguyen Van A "); request.setBirthday(LocalDate.of(2002, 5, 10));
        request.setPhone("0912345678");
        auth.register(request);
        var captor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(otp).sendOtp(captor.capture());
        User user = captor.getValue();
        assertEquals("abc@gmail.com", user.getEmail());
        assertTrue(encoder.matches("Password123!", user.getPassword()));
        assertFalse(user.isEmailVerified()); assertTrue(user.isProfileCompleted());
        assertNull(user.getGoogleSub());
    }

    @Test void localLoginAndLinkedLoginUseSameUser() {
        User user = user(true);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        var first = auth.login(new LoginRequest(" ABC@gmail.com ", "Password123!"));
        user.setGoogleSub("google-sub");
        var linked = auth.login(new LoginRequest(user.getEmail(), "Password123!"));
        assertEquals(jwt.extractSubject(first.getAccessToken()), jwt.extractSubject(linked.getAccessToken()));
        assertEquals("REFRESH", jwt.extractTokenType(first.getRefreshToken()));
    }

    @Test void rejectUnverifiedLogin() {
        User user = user(true); user.setEmailVerified(false);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        error(ErrorCode.EMAIL_NOT_VERIFIED, () -> auth.login(new LoginRequest(user.getEmail(), "Password123!")));
    }

    @Test void rejectIncompleteAndInactiveLogin() {
        User user = user(false);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        error(ErrorCode.PROFILE_INCOMPLETE, () -> auth.login(new LoginRequest(user.getEmail(), "Password123!")));
        user.setStatus(UserStatus.INACTIVE);
        error(ErrorCode.ACCOUNT_BLOCKED, () -> auth.login(new LoginRequest(user.getEmail(), "Password123!")));
    }

    @Test void unknownOrWrongPasswordHasGenericError() {
        error(ErrorCode.INVALID_CREDENTIALS, () -> auth.login(new LoginRequest("missing@gmail.com", "bad")));
        User user = user(true);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        error(ErrorCode.INVALID_CREDENTIALS, () -> auth.login(new LoginRequest(user.getEmail(), "bad")));
    }

    @Test void googleOnlyPasswordLoginFailsGracefully() {
        User user = user(true); user.setPassword(null); user.setGoogleSub("google-sub");
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        error(ErrorCode.PASSWORD_LOGIN_UNAVAILABLE, () -> auth.login(new LoginRequest(user.getEmail(), "bad")));
    }

    @Test void newGoogleUserRequiresProfile() {
        claims();
        var response = google.authenticate("credential");
        assertEquals(GoogleAuthStatus.PROFILE_REQUIRED, response.getStatus());
        assertNull(response.getAccessToken()); assertNull(response.getRefreshToken());
        assertTrue(jwt.isOnboardingToken(response.getOnboardingToken()));
        var captor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(users).saveAndFlush(captor.capture());
        User user = captor.getValue();
        assertNull(user.getPassword()); assertNull(user.getPhone()); assertNull(user.getBirthday());
        assertTrue(user.isEmailVerified()); assertFalse(user.isProfileCompleted());
        verifyNoInteractions(otp);
    }

    @Test void returningGoogleUsesSubjectBeforeEmail() {
        claims(); User user = user(true); user.setGoogleSub("google-sub");
        when(users.findByGoogleSub("google-sub")).thenReturn(Optional.of(user));
        var response = google.authenticate("credential");
        assertEquals(GoogleAuthStatus.AUTHENTICATED, response.getStatus());
        assertEquals(user.getUserId().toString(), jwt.extractSubject(response.getAccessToken()));
        verify(users, never()).findByEmail(any()); verify(users, never()).saveAndFlush(any());
    }

    @Test void emailCollisionRequiresExplicitLink() {
        claims(); User user = user(true);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        var response = google.authenticate("credential");
        assertEquals(GoogleAuthStatus.ACCOUNT_LINK_REQUIRED, response.getStatus());
        assertNull(response.getAccessToken()); assertNull(response.getOnboardingToken());
        assertNull(user.getGoogleSub()); verify(users, never()).saveAndFlush(any());
        var order = inOrder(users);
        order.verify(users).findByGoogleSub("google-sub");
        order.verify(users).findByEmail("abc@gmail.com");
    }

    @Test void completeProfile() {
        User user = user(false); user.setPassword(null); user.setGoogleSub("google-sub");
        when(users.findLockedById(user.getUserId())).thenReturn(Optional.of(user));
        String token = jwt.generateOnboardingToken(user);
        var response = google.completeProfile("Bearer " + token, profile());
        assertTrue(user.isProfileCompleted()); assertEquals("Nguyen Van A", user.getFullName());
        assertEquals("0912345678", user.getPhone());
        assertEquals("ACCESS", jwt.extractTokenType(response.getAccessToken()));
        error(ErrorCode.INVALID_ONBOARDING_TOKEN, () -> google.completeProfile("Bearer " + token, profile()));
    }

    CompleteProfileRequest profile() {
        var request = new CompleteProfileRequest();
        request.setFullName(" Nguyen Van A "); request.setBirthday(LocalDate.of(2002, 5, 10));
        request.setPhone("0912345678"); return request;
    }

    @Test void duplicatePhoneRejected() {
        User user = user(false); user.setGoogleSub("google-sub");
        when(users.findLockedById(user.getUserId())).thenReturn(Optional.of(user));
        when(users.existsByPhoneAndUserIdNot("0912345678", user.getUserId())).thenReturn(true);
        error(ErrorCode.PHONE_ALREADY_EXISTS, () -> google.completeProfile(
                "Bearer " + jwt.generateOnboardingToken(user), profile()));
        assertFalse(user.isProfileCompleted());
    }

    @Test void accessOrRefreshCannotCompleteProfile() {
        User user = user(true);
        error(ErrorCode.INVALID_ONBOARDING_TOKEN, () -> google.completeProfile(
                "Bearer " + jwt.generateAccessToken(user), profile()));
        error(ErrorCode.INVALID_ONBOARDING_TOKEN, () -> google.completeProfile(
                "Bearer " + jwt.generateRefreshToken(user), profile()));
        error(ErrorCode.INVALID_ONBOARDING_TOKEN, () -> google.completeProfile(null, profile()));
    }

    @Test void linkPreservesPasswordAndIsIdempotent() {
        claims(); User user = user(true); String password = user.getPassword();
        when(users.findLockedById(user.getUserId())).thenReturn(Optional.of(user));
        google.link(user.getUserId(), "credential");
        google.link(user.getUserId(), "credential");
        assertEquals(password, user.getPassword()); assertEquals("google-sub", user.getGoogleSub());
    }

    @Test void cannotLinkGoogleOwnedByAnotherUser() {
        claims(); User user = user(true);
        when(users.findLockedById(user.getUserId())).thenReturn(Optional.of(user));
        when(users.findByGoogleSub("google-sub")).thenReturn(Optional.of(user(true)));
        error(ErrorCode.GOOGLE_ACCOUNT_LINKED_TO_ANOTHER_USER, () -> google.link(user.getUserId(), "credential"));
    }

    @Test void cannotLinkDifferentEmailOrOverwriteSubject() {
        claims(); User user = user(true); user.setEmail("other@gmail.com");
        when(users.findLockedById(user.getUserId())).thenReturn(Optional.of(user));
        error(ErrorCode.GOOGLE_EMAIL_DOES_NOT_MATCH, () -> google.link(user.getUserId(), "credential"));
        user.setEmail("abc@gmail.com"); user.setGoogleSub("other-sub");
        error(ErrorCode.GOOGLE_ACCOUNT_ALREADY_LINKED, () -> google.link(user.getUserId(), "credential"));
    }

    @Test void refreshChecksTypeAndCurrentAccountState() {
        User user = user(true);
        when(users.findById(user.getUserId())).thenReturn(Optional.of(user));
        String refresh = jwt.generateRefreshToken(user);
        assertNotNull(auth.refresh(refresh).getAccessToken());
        error(ErrorCode.INVALID_TOKEN, () -> auth.refresh(jwt.generateAccessToken(user)));
        user.setStatus(UserStatus.INACTIVE);
        error(ErrorCode.ACCOUNT_BLOCKED, () -> auth.refresh(refresh));
    }

    @Test void logoutRevokesAccessToken() {
        String access = jwt.generateAccessToken(user(true));
        auth.logout("Bearer " + access);
        assertFalse(jwt.isTokenValid(access));
    }

    @Test void invalidGoogleCredentialRejectedBeforeLookup() {
        when(verifier.verify("bad")).thenThrow(new AppException(ErrorCode.INVALID_GOOGLE_TOKEN));
        error(ErrorCode.INVALID_GOOGLE_TOKEN, () -> google.authenticate("bad"));
        verify(users, never()).findByGoogleSub(any());
    }

    @Test void otpVerificationAndAttempts() {
        var repository = mock(EmailOtpRepository.class);
        var service = new EmailOtpServiceImpl(repository, users, mock(EmailService.class), encoder);
        User user = user(true); user.setEmailVerified(false);
        when(users.findLockedByEmail(user.getEmail())).thenReturn(Optional.of(user));
        EmailOtp record = EmailOtp.builder().user(user).otpHash(encoder.encode("123456"))
                .attempts(0).expireAt(LocalDateTime.now().plusMinutes(5)).build();
        when(repository.findByUser(user)).thenReturn(Optional.of(record));
        for (int i = 0; i < 5; i++) error(ErrorCode.OTP_INVALID, () -> service.verifyOtp(user.getEmail(), "000000"));
        error(ErrorCode.OTP_MANY_ATTEMPTS, () -> service.verifyOtp(user.getEmail(), "123456"));
        assertFalse(user.isEmailVerified());
        record.setAttempts(0);
        service.verifyOtp(" ABC@gmail.com ", "123456");
        assertTrue(user.isEmailVerified()); assertTrue(user.isProfileCompleted());
        verify(repository, atLeastOnce()).delete(record);
    }

    @Test void otpResendCooldown() {
        var repository = mock(EmailOtpRepository.class);
        var mail = mock(EmailService.class);
        var service = new EmailOtpServiceImpl(repository, users, mail, encoder);
        User user = user(true); user.setEmailVerified(false);
        when(users.findLockedByEmail(user.getEmail())).thenReturn(Optional.of(user));
        EmailOtp record = EmailOtp.builder().user(user).lastSentAt(LocalDateTime.now()).build();
        when(repository.findByUser(user)).thenReturn(Optional.of(record));
        error(ErrorCode.OTP_RESEND, () -> service.resendOtp(user.getEmail()));
        record.setLastSentAt(LocalDateTime.now().minusSeconds(61));
        service.resendOtp(user.getEmail());
        var code = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(mail).sendOtpEmail(eq(user.getEmail()), code.capture());
        assertTrue(code.getValue().matches("[0-9]{6}"));
        assertTrue(encoder.matches(code.getValue(), record.getOtpHash()));
        assertEquals(0, record.getAttempts());
    }
}
