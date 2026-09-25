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
    @jakarta.validation.constraints.Min(1)
    @jakarta.validation.constraints.Max(1000)
    private Integer adultCount;

    @NotNull(message = "Số trẻ em không được để trống")
    @jakarta.validation.constraints.Min(0)
    @jakarta.validation.constraints.Max(1000)
    private Integer childCount;

    @NotNull(message = "Vui lòng xác nhận điều khoản an toàn")
    @AssertTrue(message = "Bạn phải đồng ý với điều khoản an toàn trước khi tham gia hoạt động")
    private Boolean isSafetyTermsAccepted;

    @jakarta.validation.constraints.NotBlank(message = "Vui lòng nhập khách sạn hoặc địa điểm đón")
    @jakarta.validation.constraints.Size(max = 500, message = "Địa điểm đón tối đa 500 ký tự")
    private String pickupLocation;

    public void setPickupLocation(String value) {
        pickupLocation = value == null ? null : value.strip();
    }

    private String couponCode;
}