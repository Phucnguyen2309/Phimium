package com.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InstructionRequest {
    @NotBlank(message = "Nội dung hướng dẫn không được để trống")
    private String instructions;
}