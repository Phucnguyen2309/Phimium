package com.be.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class RegistrationRequest {

    @NotNull(message = "Departure ID không được để trống")
    private UUID departureId;

    @NotNull(message = "Số người lớn không được để trống")
    private Integer adultCount;

    @NotNull(message = "Số trẻ em không được để trống")
    private Integer childCount;

    @NotNull(message = "Vui lòng xác nhận điều khoản an toàn")
    @AssertTrue(message = "Bạn phải đồng ý với điều khoản an toàn trước khi tham gia hoạt động")
    private Boolean isSafetyTermsAccepted;

    private String couponCode;
}