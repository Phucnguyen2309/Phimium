package com.be.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignBuddyRequest {

    @NotNull(message = "Buddy ID is required")
    private UUID buddyId;
}