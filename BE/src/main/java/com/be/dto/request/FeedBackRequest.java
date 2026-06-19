package com.be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedBackRequest {

    @Min(value = 1, message = "Trip rating must be at least 1")
    @Max(value = 5, message = "Trip rating must be at most 5")
    private Integer tripRating;

    @Size(max = 1000, message = "Trip comment must not exceed 1000 characters")
    private String tripComment;

    @Min(value = 1, message = "Buddy rating must be at least 1")
    @Max(value = 5, message = "Buddy rating must be at most 5")
    private Integer buddyRating;

    @Size(max = 1000, message = "Buddy comment must not exceed 1000 characters")
    private String buddyComment;
}