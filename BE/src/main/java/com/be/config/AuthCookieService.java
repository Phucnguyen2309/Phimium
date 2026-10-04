package com.be.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
public class AuthCookieService {

    public static final String ACCESS_COOKIE = "phimium_access";
    public static final String REFRESH_COOKIE = "phimium_refresh";

    private static final String ACCESS_PATH = "/api";
    private static final String REFRESH_PATH = "/api/auth";

    @Value("${auth.cookie.secure:true}")
    private boolean secure;

    @Value("${auth.cookie.same-site:Lax}")
    private String sameSite;

    public void writeTokens(HttpServletResponse response, String accessToken, String refreshToken) {
        if (accessToken != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, build(ACCESS_COOKIE, accessToken, ACCESS_PATH, -1).toString());
        }
        if (refreshToken != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, build(REFRESH_COOKIE, refreshToken, REFRESH_PATH, -1).toString());
        }
    }

    public void clearTokens(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, build(ACCESS_COOKIE, "", ACCESS_PATH, 0).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, build(REFRESH_COOKIE, "", REFRESH_PATH, 0).toString());
    }

    public Optional<String> readAccessToken(HttpServletRequest request) {
        return read(request, ACCESS_COOKIE);
    }

    public Optional<String> readRefreshToken(HttpServletRequest request) {
        return read(request, REFRESH_COOKIE);
    }

    private Optional<String> read(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();
        return Arrays.stream(cookies)
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();
    }

    private ResponseCookie build(String name, String value, String path, long maxAgeSeconds) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(path);
        if (maxAgeSeconds >= 0) builder.maxAge(maxAgeSeconds);
        return builder.build();
    }
}
