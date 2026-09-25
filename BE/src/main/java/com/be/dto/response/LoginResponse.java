package com.be.dto.response;

import com.be.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String username;
    private String accessToken;
    private String refreshToken;
    private String buddyId;
    private UserRole role;

}
