package com.be.validator;

import com.be.entity.ActivityDeparture;
import com.be.entity.ItineraryStop;
import com.be.enums.DepartureStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.util.DateTimeUtils;

import java.time.Duration;
import java.util.Collection;
import java.util.List;

public final class ItineraryValidator {
    private ItineraryValidator() {
    }

    public static void validate(List<ItineraryStop> stops, Collection<ActivityDeparture> departures) {
        if (stops == null || stops.size() > 20) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Invalid itinerary stops");
        }
        int previousEnd = 0;
        for (ItineraryStop stop : stops) {
            if (stop == null || stop.getOffsetMinutes() == null || stop.getDurationMinutes() == null
                    || stop.getOffsetMinutes() < 0 || stop.getOffsetMinutes() > 1440
                    || stop.getDurationMinutes() < 1 || stop.getDurationMinutes() > 1440) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Invalid itinerary timing");
            }
            if (stop.getOffsetMinutes() < previousEnd) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        "Itinerary stops must be ordered and must not overlap");
            }
            previousEnd = stop.getOffsetMinutes() + stop.getDurationMinutes();
        }
        if (departures == null) {
            return;
        }
        for (ActivityDeparture departure : departures) {
            if (departure.getStatus() != DepartureStatus.CANCELLED
                    && departure.getStartDateTime().isAfter(DateTimeUtils.nowVietnam())
                    && previousEnd > Duration.between(departure.getStartTime(), departure.getEndTime()).toMinutes()) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Itinerary exceeds a departure's duration");
            }
        }
    }
}
