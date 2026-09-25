package com.be;

import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.GoogleTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AuthenticationGoogleConfigurationTests {
    @Test
    void configuredClientIdIsUsedAsGoogleAudience() {
        String configured = System.getenv("GOOGLE_CLIENT_ID");
        String clientId = configured == null ? "test-client.apps.googleusercontent.com" : configured;
        new ApplicationContextRunner()
                .withPropertyValues("google.client-id=" + clientId)
                .withUserConfiguration(GoogleTokenVerifier.class)
                .run(context -> {
                    assertNull(context.getStartupFailure());
                    GoogleTokenVerifier service = context.getBean(GoogleTokenVerifier.class);
                    GoogleIdTokenVerifier verifier = (GoogleIdTokenVerifier)
                            ReflectionTestUtils.getField(service, "verifier");
                    assertNotNull(verifier);
                    assertEquals(List.of(clientId), List.copyOf(verifier.getAudience()));
                    AppException exception = assertThrows(AppException.class,
                            () -> service.verify("not-a-google-id-token"));
                    assertEquals(ErrorCode.INVALID_GOOGLE_TOKEN, exception.getErrorCode());
                });
    }

    @Test
    void emptyClientIdIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> new GoogleTokenVerifier(" "));
    }
}
