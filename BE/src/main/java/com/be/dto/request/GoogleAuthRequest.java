package com.be.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class GoogleAuthRequest {
    @NotBlank
    private String credential;
}
