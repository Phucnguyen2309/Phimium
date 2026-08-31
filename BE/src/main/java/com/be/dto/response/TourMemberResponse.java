package com.be.dto.response;

import com.be.enums.CheckInStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourMemberResponse {
    private UUID registrationId;
    private UUID userId;
    private String guestName;
    private String phoneNumber;
    private Integer adultCount;
    private Integer childCount;
    private Integer participantCount;
    private CheckInStatus checkInStatus;
    private LocalDateTime checkedInAt;
}