package com.be.config;

import com.be.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    @Value("${TOKEN_SECRET_KEY}")
    private String secretkey;

    @Value("${TOKEN_EXPIRE_MS:86400000}")
    private long expireMs;

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretkey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expireMs);

        return Jwts.builder()
                .setSubject(user.getUserId().toString())
                .claim("username", user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(now)
                .setExpiration(exp)
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

    public String extractUsername(String token) {
        Object username = extractClaimsJws(token).get("username");
        return username == null ? null : username.toString();
    }

    public boolean isTokenValid(String token) {
        try{
            extractClaimsJws(token);
            return true;
        }catch (Exception e){
            return false;
        }
    }




}
