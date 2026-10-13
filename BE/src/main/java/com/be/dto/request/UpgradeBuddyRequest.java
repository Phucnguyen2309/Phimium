package com.be.dto.request;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class UpgradeBuddyRequest extends BuddyMatchingProfileRequest {
    @NotNull(message = "Bio is required")
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    @NotNull(message = "Experience is required")
    @Size(max = 1000, message = "Experience must not exceed 1000 characters")
    private String experience;

    @NotNull(message = "Introduction is required")
    @Size(max = 1000, message = "Introduction must not exceed 1000 characters")
    private String introduction;
}
