package com.be.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CompleteProfileRequest {
    @NotBlank @Size(max = 100)
    private String fullName;
    @NotNull @Past
    private LocalDate birthday;
    @NotBlank @Pattern(regexp = "^0[35789]\\d{8}$")
    private String phone;

    public void setFullName(String value) { fullName = value == null ? null : value.trim(); }
    public void setPhone(String value) { phone = value == null ? null : value.trim(); }
}
