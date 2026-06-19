package com.be.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedBackResponse {

    private UUID feedbackId;

    private UUID reviewerId;

    private String reviewerName;

    private UUID buddyId;

    private String buddyName;

    private UUID registrationId;

    private UUID activityId;

    private String activityTitle;

    private Integer tripRating;

    private String tripComment;

    private Integer buddyRating;

    private String buddyComment;

    private LocalDateTime createdAt;
}