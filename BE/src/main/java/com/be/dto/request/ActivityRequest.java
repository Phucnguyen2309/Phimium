package com.be.dto.request;

import com.be.enums.ActivityStatus;
import com.be.enums.TourType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    private String description;

    @NotNull(message = "Activity type is required")
    private TourType activityType;

    @NotNull(message = "Registration deadline is required")
    private LocalDateTime registrationDeadline;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private BigDecimal longitude;

    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private BigDecimal latitude;

    @NotBlank(message = "Location name is required")
    @Size(max = 255)
    private String locationName;

    @NotBlank(message = "Address is required")
    @Size(max = 500)
    private String address;

    @NotNull(message = "Participation fee is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal participationFee = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal childParticipationFee;

    @NotNull
    @Min(1)
    private Integer minimumParticipants;

    @NotNull
    @Min(1)
    private Integer maximumParticipants;

    @Min(1)
    private Integer groupMinSize = 2;

    @Min(1)
    private Integer groupMaxSize = 4;

    private ActivityStatus status = ActivityStatus.PUBLISHED;


    @Valid
    @NotEmpty(message = "At least one departure is required")
    private List<DepartureRequest> departures;

    @AssertTrue(message = "Maximum participants must be greater than or equal to minimum participants")
    public boolean isParticipantRangeValid() {
        return minimumParticipants == null
                || maximumParticipants == null
                || maximumParticipants >= minimumParticipants;
    }
}