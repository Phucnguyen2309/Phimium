package com.be.dto.response;
import com.be.enums.GoogleAuthStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GoogleAuthResponse {
    private GoogleAuthStatus status;
    private String accessToken;
    private String refreshToken;
    private String onboardingToken;
    private String email;
    private String fullName;
    private String message;
}
