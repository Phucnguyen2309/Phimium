package com.be.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.Locale;

@Data
public class RegisterRequest {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(max = 72)
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$")
    private String password;
    @NotBlank @Size(min = 2, max = 100)
    @JsonAlias("fullname")
    private String fullName;
    @NotNull @Past
    @JsonAlias("birthdate")
    private LocalDate birthday;
    @NotBlank @Pattern(regexp = "^0[35789]\\d{8}$")
    private String phone;

    public void setEmail(String value) { email = value == null ? null : value.trim().toLowerCase(Locale.ROOT); }
    public void setFullName(String value) { fullName = value == null ? null : value.trim(); }
    public void setPhone(String value) { phone = value == null ? null : value.trim(); }
}
