package com.be.service;

import com.be.entity.User;
import io.jsonwebtoken.Claims;

import java.util.Date;

public interface JwtService {
    String generateToken(User user);

    String generateAccessToken(User user);

    String generateRefreshToken(User user);

    String generateOnboardingToken(User user);

    String extractTokenType(String token);

    boolean isOnboardingToken(String token);

    Claims extractClaimsJws(String token);

    String extractSubject(String token);

    String extractRole(String token);

    String extractBuddyId(String token);

    String extractUsername(String token);

    Date extractExpiration(String token);

    void blacklistToken(String token);

    boolean isTokenBlacklisted(String token);

    boolean isTokenValid(String token);
}
