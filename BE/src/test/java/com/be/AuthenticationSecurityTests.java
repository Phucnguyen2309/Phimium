package com.be;

import com.be.config.*;
import com.be.controller.AuthController;
import com.be.entity.User;
import com.be.enums.*;
import com.be.repository.*;
import com.be.service.*;
import com.be.service.impl.GoogleAuthServiceImpl;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(properties = "TOKEN_SECRET_KEY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", controllers = {AuthController.class, AuthenticationSecurityTests.ProbeController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class,
        GoogleAuthServiceImpl.class, AuthTokenService.class, AuthenticationSecurityTests.ProbeController.class})
class AuthenticationSecurityTests {
    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @MockitoBean UserRepository users;
    @MockitoBean BuddyRepository buddies;
    @MockitoBean GoogleTokenVerifier verifier;
    @MockitoBean AuthService auth;
    @MockitoBean EmailOtpService otp;

    @RestController
    static class ProbeController {
        @GetMapping("/api/private-probe") String probe() { return "ok"; }
    }

    @BeforeEach void setup() {
        ReflectionTestUtils.setField(jwt, "secretkey", Base64.getEncoder().encodeToString(new byte[32]));
        ReflectionTestUtils.setField(jwt, "expireMs", 86400000L);
        ReflectionTestUtils.setField(jwt, "refreshExpireMs", 604800000L);
    }

    User user(boolean complete) {
        User user = User.builder().userId(UUID.randomUUID()).email("abc@gmail.com")
                .googleSub("google-sub").role(UserRole.USER).status(UserStatus.ACTIVE)
                .emailVerified(true).profileCompleted(complete).build();
        when(users.findById(user.getUserId())).thenReturn(Optional.of(user));
        when(users.findLockedById(user.getUserId())).thenReturn(Optional.of(user));
        return user;
    }

    @Test void onboardingAndRefreshNeverAuthorizeBusinessOrLink() throws Exception {
        User user = user(false);
        String onboarding = jwt.generateOnboardingToken(user);
        user.setProfileCompleted(true);
        for (String token : List.of(onboarding, jwt.generateRefreshToken(user))) {
            mvc.perform(get("/api/private-probe").header("Authorization", "Bearer " + token))
                    .andExpect(status().isUnauthorized());
            mvc.perform(post("/api/auth/link/google").header("Authorization", "Bearer " + token)
                    .contentType("application/json").content("{\"credential\":\"abc\"}"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test void accessAuthorizesBusinessButAccountStateIsRechecked() throws Exception {
        User user = user(true); String token = jwt.generateAccessToken(user);
        mvc.perform(get("/api/private-probe").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        user.setStatus(UserStatus.INACTIVE);
        mvc.perform(get("/api/private-probe").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test void completeProfileRequiresOnboardingTokenAndCannotReplay() throws Exception {
        User user = user(false); String token = jwt.generateOnboardingToken(user);
        String body = "{\"fullName\":\"Nguyen Van A\",\"birthday\":\"2002-05-10\",\"phone\":\"0912345678\"}";
        mvc.perform(post("/api/auth/complete-profile").contentType("application/json").content(body))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/complete-profile").header("Authorization", "Bearer " + token)
                .contentType("application/json").content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.accessToken").isNotEmpty());
        mvc.perform(post("/api/auth/complete-profile").header("Authorization", "Bearer " + token)
                .contentType("application/json").content(body)).andExpect(status().isUnauthorized());
    }

    @Test void registerRejectsFutureBirthdayAndInvalidPhone() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json")
                .content("{\"email\":\"a@gmail.com\",\"password\":\"Password123!\",\"fullName\":\"Abc\",\"birthday\":\"2999-01-01\",\"phone\":\"bad\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(auth);
    }

    @Test void linkRequiresAccess() throws Exception {
        mvc.perform(post("/api/auth/link/google").contentType("application/json")
                .content("{\"credential\":\"abc\"}")).andExpect(status().isUnauthorized());
    }
}
