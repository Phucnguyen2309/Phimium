package com.be.service;

public interface GoogleTokenVerifier {
    VerifiedGoogleUser verify(String credential);

    record VerifiedGoogleUser(String subject, String email, String name) {}
}
