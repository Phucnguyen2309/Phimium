package com.be.controller;

import com.be.dto.response.ApiResponse;
import com.be.dto.response.ItineraryStopResponse;
import com.be.service.ItineraryStopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity/{activityId}/itinerary-stops")
@RequiredArgsConstructor
@Tag(name = "Itinerary Stops", description = "View the approved tour itinerary")
public class ItineraryStopController {
    private final ItineraryStopService itineraryStopService;

    @GetMapping
    @Operation(summary = "List itinerary stops in chronological order")
    public ResponseEntity<ApiResponse<List<ItineraryStopResponse>>> getStops(@PathVariable UUID activityId) {
        return ResponseEntity.ok(ApiResponse.success("Success", itineraryStopService.getStops(activityId)));
    }

    @GetMapping("/{stopId}")
    @Operation(summary = "View an itinerary stop belonging to a tour")
    public ResponseEntity<ApiResponse<ItineraryStopResponse>> getStop(@PathVariable UUID activityId,
                                                                     @PathVariable UUID stopId) {
        return ResponseEntity.ok(ApiResponse.success("Success", itineraryStopService.getStop(activityId, stopId)));
    }
}
