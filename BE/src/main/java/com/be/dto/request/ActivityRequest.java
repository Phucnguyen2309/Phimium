package com.be.dto.request;

import com.be.enums.ActivityStatus;
import com.be.enums.ActivityType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "Activity type is required")
    private ActivityType activityType;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180")
    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180")
    private BigDecimal longitude;

    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90")
    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90")
    private BigDecimal latitude;

    @NotNull(message = "Registration deadline is required")
    private LocalDateTime registrationDeadline;

    @NotBlank(message = "Location name is required")
    @Size(max = 255, message = "Location name must not exceed 255 characters")
    private String locationName;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @DecimalMin(value = "0.0", inclusive = true, message = "Participation fee must be greater than or equal to 0")
    private BigDecimal participationFee = BigDecimal.ZERO;

    @NotNull(message = "Minimum participants is required")
    @Min(value = 1, message = "Minimum participants must be at least 1")
    private Integer minimumParticipants;

    @NotNull(message = "Maximum participants is required")
    @Min(value = 1, message = "Maximum participants must be at least 1")
    private Integer maximumParticipants;

    @Min(value = 1, message = "Group min size must be at least 1")
    private Integer groupMinSize = 4;

    @Min(value = 1, message = "Group max size must be at least 1")
    private Integer groupMaxSize = 6;

    private UUID hostId;

    private ActivityStatus status = ActivityStatus.PUBLISHED;

    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeAfterStartTime() {
        return startTime == null || endTime == null || endTime.isAfter(startTime);
    }

    @AssertTrue(message = "Registration deadline must be before start time")
    public boolean isRegistrationDeadlineBeforeStartTime() {
        return registrationDeadline == null
                || startTime == null
                || registrationDeadline.isBefore(startTime);
    }

    @AssertTrue(message = "Maximum participants must be greater than or equal to minimum participants")
    public boolean isParticipantRangeValid() {
        return minimumParticipants == null
                || maximumParticipants == null
                || maximumParticipants >= minimumParticipants;
    }

    @AssertTrue(message = "Group max size must be greater than or equal to group min size")
    public boolean isGroupSizeRangeValid() {
        return groupMinSize == null
                || groupMaxSize == null
                || groupMaxSize >= groupMinSize;
    }
}
