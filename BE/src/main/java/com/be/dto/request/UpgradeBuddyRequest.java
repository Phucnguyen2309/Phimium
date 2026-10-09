package com.be.dto.request;


import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@lombok.EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpgradeBuddyRequest extends BuddyMatchingProfileRequest {
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    @Size(max = 1000, message = "Experience must not exceed 1000 characters")
    private String experience;

    @Size(max = 1000, message = "Introduction must not exceed 1000 characters")
    private String introduction;
}
