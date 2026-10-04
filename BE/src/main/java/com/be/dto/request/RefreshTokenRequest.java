package com.be.dto.request;
import lombok.Data;
@Data
public class RefreshTokenRequest {
    /** Không bắt buộc: FE web gửi refresh token qua cookie HttpOnly, body chỉ dùng cho client khác (Swagger, test). */
    private String refreshToken;
}
