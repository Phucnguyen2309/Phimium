package com.be.dto.response;

import com.be.enums.CheckInStatus;
import com.be.enums.RegistrationStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RegistrationResponse {

    private UUID registrationId;
    private RegistrationStatus status;
    private DepartureInfo departure;
    private Integer adultCount;
    private Integer childCount;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BuddyInfo buddy;
    private CheckInStatus checkInStatus;
    private LocalDateTime registeredAt;
    private LocalDateTime checkedInAt;
    private LocalDateTime cancelledAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartureInfo {
        private UUID departureId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private ActivityInfo activity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityInfo {
        private UUID activityId;
        private String title;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BuddyInfo {
        private UUID buddyId;
        private String name;
        private BigDecimal averageRating;
    }
}