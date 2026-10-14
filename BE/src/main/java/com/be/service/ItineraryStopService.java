package com.be.service;

import com.be.dto.request.ItineraryStopRequest;
import com.be.dto.response.ItineraryStopResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface ItineraryStopService {
    List<ItineraryStopResponse> getStops(UUID activityId);

    ItineraryStopResponse getStop(UUID activityId, UUID stopId);

    List<ItineraryStopResponse> createStops(UUID activityId, List<ItineraryStopRequest> requests,
                                            List<MultipartFile> images) throws IOException;

    ItineraryStopResponse createStop(UUID activityId, ItineraryStopRequest request, MultipartFile image)
            throws IOException;

    ItineraryStopResponse updateStop(UUID activityId, UUID stopId, ItineraryStopRequest request, MultipartFile image)
            throws IOException;

    void deleteStop(UUID activityId, UUID stopId);

    ItineraryStopResponse deleteImage(UUID activityId, UUID stopId);
}
