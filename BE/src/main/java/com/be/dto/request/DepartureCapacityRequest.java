package com.be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DepartureCapacityRequest(@NotNull @Min(1) @Max(1000000) Integer totalCapacity) {}
