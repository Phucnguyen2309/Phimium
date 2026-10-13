package com.be.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class RegistrationRequest {

    @NotNull(message = "Departure ID không được để trống")
    private UUID departureId;

    private UUID matchResultId;

    @NotNull(message = "Số người lớn không được để trống")
    @Min(1)
    @Max(1000)
    private Integer adultCount;

    @NotNull(message = "Số trẻ em không được để trống")
    @Min(0)
    @Max(1000)
    private Integer childCount;

    @NotNull(message = "Vui lòng xác nhận điều khoản an toàn")
    @AssertTrue(message = "Bạn phải đồng ý với điều khoản an toàn trước khi tham gia hoạt động")
    private Boolean isSafetyTermsAccepted;

    @NotBlank(message = "Vui lòng nhập khách sạn hoặc địa điểm đón")
    @Size(max = 500, message = "Địa điểm đón tối đa 500 ký tự")
    private String pickupLocation;

    public void setPickupLocation(String value) {
        pickupLocation = value == null ? null : value.strip();
    }

    private String couponCode;
}