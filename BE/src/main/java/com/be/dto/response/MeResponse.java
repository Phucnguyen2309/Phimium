package com.be.dto.response;

import com.be.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Thông tin người dùng đang đăng nhập (GET /api/auth/me). Không chứa token. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeResponse {
    private String userId;
    private String username;
    private String fullName;
    private UserRole role;
    private String buddyId;
}
