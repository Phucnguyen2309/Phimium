package com.be.config;

import com.be.entity.User;
import com.be.repository.BuddyRepository;
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
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class JwtService {
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

    public String generateToken(User user) { return generateAccessToken(user); }

    public String generateAccessToken(User user) {
        if (!user.isEnabled() || !user.isEmailVerified() || !user.isProfileCompleted()) {
            throw new com.be.exception.AppException(com.be.exception.ErrorCode.USER_NOT_AUTHORIZED);
        }
        return generate(user, "ACCESS", expireMs);
    }

    @Value("${spring.jwt.refresh-expiration:604800000}")
    private long refreshExpireMs;

    public String generateRefreshToken(User user) {
        if (!user.isEnabled() || !user.isEmailVerified() || !user.isProfileCompleted()) {
            throw new com.be.exception.AppException(com.be.exception.ErrorCode.USER_NOT_AUTHORIZED);
        }
        return generate(user, "REFRESH", refreshExpireMs);
    }

    public String generateOnboardingToken(User user) {
        if (!user.isEnabled() || !user.isEmailVerified() || user.isProfileCompleted() || user.getGoogleSub() == null) {
            throw new com.be.exception.AppException(com.be.exception.ErrorCode.INVALID_ONBOARDING_TOKEN);
        }
        return generate(user, "ONBOARDING", 600000);
    }

    public String extractTokenType(String token) {
        return extractClaimsJws(token).get("tokenType", String.class);
    }

    public boolean isOnboardingToken(String token) {
        return isTokenValid(token) && "ONBOARDING".equals(extractTokenType(token));
    }

    private String generate(User user, String tokenType, long lifetime) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + lifetime);

        var builder = Jwts.builder()
                .setSubject(user.getUserId().toString()).id(java.util.UUID.randomUUID().toString()).claim("tokenType", tokenType)
                .claim("username", user.getEmail())
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

    public Claims extractClaimsJws(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractSubject(String token) {
        return extractClaimsJws(token).getSubject();
    }
    public String extractRole(String token) {
        Object role = extractClaimsJws(token).get("role");
        return role == null ? null : role.toString();
    }

    public String extractBuddyId(String token) {
        Object buddyId = extractClaimsJws(token).get("buddyId");
        return buddyId == null ? null : buddyId.toString();
    }

    public String extractUsername(String token) {
        Object username = extractClaimsJws(token).get("username");
        return username == null ? null : username.toString();
    }

    public Date extractExpiration(String token) {
        return extractClaimsJws(token).getExpiration();
    }

    public void blacklistToken(String token) {
        blacklistedTokens.put(token, extractExpiration(token));
    }

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

    public boolean isTokenValid(String token) {
        try{
            extractClaimsJws(token);
            return !isTokenBlacklisted(token);
        }catch (Exception e){
            return false;
        }
    }




}
