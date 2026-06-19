package com.be.dto.response;

import com.be.enums.CheckInStatus;
import com.be.enums.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationResponse {
    private UUID registrationId;
    private UUID activityId;
    private UUID userId;
    private UUID groupId;
    private RegistrationStatus status;
    private CheckInStatus checkInStatus;
    private LocalDateTime registeredAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime checkedInAt;
}
