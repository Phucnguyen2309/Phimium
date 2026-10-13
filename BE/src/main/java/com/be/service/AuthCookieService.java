package com.be.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Optional;

public interface AuthCookieService {
    String ACCESS_COOKIE = "phimium_access";
    String REFRESH_COOKIE = "phimium_refresh";

    void writeTokens(HttpServletResponse response, String accessToken, String refreshToken);

    void clearTokens(HttpServletResponse response);

    Optional<String> readAccessToken(HttpServletRequest request);

    Optional<String> readRefreshToken(HttpServletRequest request);
}
