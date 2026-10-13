package com.be.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryStopRequest {
    @NotBlank
    @Size(max = 200)
    @Schema(example = "Chụp ảnh tại phố cổ")
    private String title;

    @NotBlank
    @Size(max = 1000)
    @Schema(example = "Buddy hướng dẫn chọn góc chụp và giới thiệu kiến trúc địa phương.")
    private String description;

    @NotNull
    @Min(0)
    @Max(1440)
    @Schema(description = "Minutes after the departure start time", example = "30")
    private Integer offsetMinutes;

    @NotNull
    @Min(1)
    @Max(1440)
    @Schema(example = "45")
    private Integer durationMinutes;

    @NotNull
    @Builder.Default
    @Schema(description = "Clear the existing image; cannot be combined with an image upload", example = "false")
    private Boolean removeImage = false;
}
