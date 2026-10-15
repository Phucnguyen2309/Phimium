package com.be.dto.response;

import com.be.enums.MatchingTag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDetailResponse {
    private String title;
    private String description;
    private String descriptionEn;
    private Set<MatchingTag> tags;
    private List<ItineraryStopResponse> itineraryStops;
    private String thumbnailUrl;
    private List<String> imageUrls;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String locationName;
    private String address;
    private BigDecimal participationFee;
    private Integer maximumParticipants;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private UUID hostBuddyId;
    private String hostBuddyName;
    private String avatarUrl;
    private String introduction;
    private int averageRating;


}
