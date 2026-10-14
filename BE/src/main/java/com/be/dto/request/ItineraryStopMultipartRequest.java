package com.be.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ItineraryStopMultipartRequest {
    @Schema(description = "Itinerary stop information as an application/json part")
    private java.util.List<ItineraryStopRequest> request;

    @Schema(description = "Optional representative image; omit on update to retain the current image",
            type = "string", format = "binary")
    private MultipartFile image;
}
