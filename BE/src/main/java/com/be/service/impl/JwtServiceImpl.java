package com.be.service.impl;

import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.repository.BuddyRepository;
import com.be.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;

import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {
    private final BuddyRepository buddyRepository;

    @Value("${TOKEN_SECRET_KEY}")
    private String secretkey;

    @Value("${TOKEN_EXPIRE_MS:86400000}")
    private long expireMs;

    private final Map<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretkey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public String generateToken(User user) { return generateAccessToken(user); }

    @Override
    public String generateAccessToken(User user) {
        if (!user.isEnabled() || !user.isEmailVerified() || !user.isProfileCompleted()) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }
        return generate(user, "ACCESS", expireMs);
    }

    @Value("${spring.jwt.refresh-expiration:604800000}")
    private long refreshExpireMs;

    @Override
    public String generateRefreshToken(User user) {
        if (!user.isEnabled() || !user.isEmailVerified() || !user.isProfileCompleted()) {
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        }
        return generate(user, "REFRESH", refreshExpireMs);
    }

    @Override
    public String generateOnboardingToken(User user) {
        if (!user.isEnabled() || !user.isEmailVerified() || user.isProfileCompleted() || user.getGoogleSub() == null) {
            throw new AppException(ErrorCode.INVALID_ONBOARDING_TOKEN);
        }
        return generate(user, "ONBOARDING", 600000);
    }

    @Override
    public String extractTokenType(String token) {
        return extractClaimsJws(token).get("tokenType", String.class);
    }

    @Override
    public boolean isOnboardingToken(String token) {
        return isTokenValid(token) && "ONBOARDING".equals(extractTokenType(token));
    }

    private String generate(User user, String tokenType, long lifetime) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + lifetime);

        var builder = Jwts.builder()
                .setSubject(user.getUserId().toString()).id(UUID.randomUUID().toString()).claim("tokenType", tokenType)
                .claim("username", user.getEmail())
                .claim("fullName", user.getFullName())
                .claim("role", user.getRole().name())
                .setIssuedAt(now)
                .setExpiration(exp);

        if ("BUDDY".equals(user.getRole().name())) {
            buddyRepository.findByUser_UserId(user.getUserId())
                    .ifPresent(buddy ->
                            builder.claim("buddyId", buddy.getBuddyId().toString())
                    );
        }

        return builder
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    @Override
    public Claims extractClaimsJws(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public String extractSubject(String token) {
        return extractClaimsJws(token).getSubject();
    }
    @Override
    public String extractRole(String token) {
        Object role = extractClaimsJws(token).get("role");
        return role == null ? null : role.toString();
    }

    @Override
    public String extractBuddyId(String token) {
        Object buddyId = extractClaimsJws(token).get("buddyId");
        return buddyId == null ? null : buddyId.toString();
    }

    @Override
    public String extractUsername(String token) {
        Object username = extractClaimsJws(token).get("username");
        return username == null ? null : username.toString();
    }

    @Override
    public Date extractExpiration(String token) {
        return extractClaimsJws(token).getExpiration();
    }

    @Override
    public void blacklistToken(String token) {
        blacklistedTokens.put(token, extractExpiration(token));
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        Date expiration = blacklistedTokens.get(token);
        if (expiration == null) {
            return false;
        }

        if (expiration.before(new Date())) {
            blacklistedTokens.remove(token);
            return false;
        }

        return true;
    }

    @Override
    public boolean isTokenValid(String token) {
        try{
            extractClaimsJws(token);
            return !isTokenBlacklisted(token);
        }catch (Exception e){
            return false;
        }
    }




}
