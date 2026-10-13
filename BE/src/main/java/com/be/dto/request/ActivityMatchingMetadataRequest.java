package com.be.dto.request;

import com.be.enums.MatchingTag;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Schema(description = "Tour matching tags; itinerary stops are managed through the separate itinerary API")
public class ActivityMatchingMetadataRequest {
    @NotNull @Size(max = 16)
    private Set<@NotNull MatchingTag> tags = new LinkedHashSet<>();
}
