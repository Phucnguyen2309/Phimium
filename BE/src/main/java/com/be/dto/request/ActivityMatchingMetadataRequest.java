package com.be.dto.request;

import com.be.entity.ItineraryStop;
import com.be.enums.MatchingTag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.*;

@Data
public class ActivityMatchingMetadataRequest {
    @NotNull @Size(max = 16)
    private Set<@NotNull MatchingTag> tags = new LinkedHashSet<>();
    @NotNull @Size(max = 20) @Valid
    private List<@NotNull ItineraryStop> itineraryStops = new ArrayList<>();
}
