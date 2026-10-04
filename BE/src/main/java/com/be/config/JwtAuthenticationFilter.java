package com.be.config;

import com.be.entity.User;
import com.be.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuthCookieService authCookieService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        /*
         * Ưu tiên header Bearer (Swagger, onboarding Google), nếu không có thì đọc cookie HttpOnly
         * mà FE nhận được khi đăng nhập.
         */
        String token = authHeader != null && authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authCookieService.readAccessToken(request).orElse(null);

        if (token == null || token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtService.isTokenValid(token) || !"ACCESS".equals(jwtService.extractTokenType(token))) {
            filterChain.doFilter(request, response);
            return;
        }

        /*
         * Không tạo lại Authentication nếu request đã được xác thực.
         */
        if (SecurityContextHolder.getContext()
                .getAuthentication() == null) {

            String subject = jwtService.extractSubject(token);

            try {
                UUID userId = UUID.fromString(subject);

                User currentUser = userRepository
                        .findById(userId)
                        .orElse(null);

                if (currentUser != null
                        && currentUser.isEnabled() && currentUser.isEmailVerified() && currentUser.isProfileCompleted()) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    currentUser,
                                    null,
                                    currentUser.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }

            } catch (IllegalArgumentException exception) {
                /*
                 * Subject không phải UUID hợp lệ.
                 * Không xác thực và tiếp tục filter chain.
                 */
            }
        }

        filterChain.doFilter(request, response);
    }
}