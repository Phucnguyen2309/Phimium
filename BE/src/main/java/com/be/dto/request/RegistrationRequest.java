package com.be.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class RegistrationRequest {
    @NotNull(message = "Activity ID không được để trống")
    private UUID activityId;
    @NotNull(message = "Vui lòng xác nhận điều khoản an toàn")
    @AssertTrue(message = "Bạn phải đồng ý với điều khoản an toàn trước khi tham gia hoạt động")
    private Boolean isSafetyTermsAccepted;
}