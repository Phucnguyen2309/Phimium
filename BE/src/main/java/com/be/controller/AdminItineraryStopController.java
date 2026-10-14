package com.be.controller;

import com.be.dto.request.ItineraryStopMultipartRequest;
import com.be.dto.request.ItineraryStopRequest;
import com.be.dto.response.ApiResponse;
import com.be.dto.response.ItineraryStopResponse;
import com.be.service.ItineraryStopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/activities/{activityId}/itinerary-stops")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Itinerary Stops", description = "Manage each tour itinerary stop and its representative image")
public class AdminItineraryStopController {
    private final ItineraryStopService itineraryStopService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create itinerary stops",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = ItineraryStopMultipartRequest.class),
                    encoding = {
                            @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE),
                            @Encoding(name = "image", contentType = "image/*")
                    })))
    public ResponseEntity<ApiResponse<List<ItineraryStopResponse>>> createStops(
            @PathVariable UUID activityId,
            @Valid @RequestPart("request") List<ItineraryStopRequest> request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        List<MultipartFile> fileList = images != null && !images.isEmpty() ? images : (image != null ? List.of(image) : List.of());
        return ResponseEntity.ok(ApiResponse.success("Itinerary stops created",
                itineraryStopService.createStops(activityId, request, fileList)));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create itinerary stops via JSON list")
    public ResponseEntity<ApiResponse<List<ItineraryStopResponse>>> createStopsJson(
            @PathVariable UUID activityId,
            @Valid @org.springframework.web.bind.annotation.RequestBody List<ItineraryStopRequest> request) throws IOException {
        return ResponseEntity.ok(ApiResponse.success("Itinerary stops created",
                itineraryStopService.createStops(activityId, request, List.of())));
    }

    @PutMapping(value = "/{stopId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update an itinerary stop and optionally replace or clear its image",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = ItineraryStopMultipartRequest.class),
                    encoding = {
                            @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE),
                            @Encoding(name = "image", contentType = "image/*")
                    })))
    public ResponseEntity<ApiResponse<ItineraryStopResponse>> updateStop(
            @PathVariable UUID activityId,
            @PathVariable UUID stopId,
            @Valid @RequestPart("request") ItineraryStopRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(ApiResponse.success("Itinerary stop updated",
                itineraryStopService.updateStop(activityId, stopId, request, image)));
    }

    @DeleteMapping("/{stopId}")
    @Operation(summary = "Delete an itinerary stop")
    public ResponseEntity<ApiResponse<Void>> deleteStop(@PathVariable UUID activityId, @PathVariable UUID stopId) {
        itineraryStopService.deleteStop(activityId, stopId);
        return ResponseEntity.ok(ApiResponse.success("Itinerary stop deleted", null));
    }

    @DeleteMapping("/{stopId}/image")
    @Operation(summary = "Clear the representative image without deleting the itinerary stop")
    public ResponseEntity<ApiResponse<ItineraryStopResponse>> deleteImage(@PathVariable UUID activityId,
                                                                         @PathVariable UUID stopId) {
        return ResponseEntity.ok(ApiResponse.success("Itinerary stop image cleared",
                itineraryStopService.deleteImage(activityId, stopId)));
    }
}
