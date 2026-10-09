package com.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryStop {
    @NotBlank @Size(max = 200)
    @Column(name = "stop_title", nullable = false, length = 200)
    private String title;
    @NotBlank @Size(max = 1000)
    @Column(name = "stop_description", nullable = false, length = 1000)
    private String description;
    @NotNull @Min(0) @Max(1440)
    @Column(name = "offset_minutes", nullable = false)
    private Integer offsetMinutes;
    @NotNull @Min(1) @Max(1440)
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;
}
