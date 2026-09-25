package com.be.service;

import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GoogleTokenVerifier {
    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${google.client-id}") String clientId) {
        if (clientId.isBlank()) throw new IllegalArgumentException("GOOGLE_CLIENT_ID is required");
        verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(List.of(clientId)).build();
    }

    public VerifiedGoogleUser verify(String credential) {
        try {
            var token = verifier.verify(credential);
            if (token == null) throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            var payload = token.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())
                    || payload.getSubject() == null || payload.getSubject().isBlank()
                    || payload.getEmail() == null || payload.getEmail().isBlank()) {
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }
            return new VerifiedGoogleUser(payload.getSubject(), payload.getEmail(),
                    (String) payload.get("name"));
        } catch (java.io.IOException | java.security.GeneralSecurityException | IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
    }

    public record VerifiedGoogleUser(String subject, String email, String name) {}
}
