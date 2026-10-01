package com.be;

import com.be.dto.request.ActivityRequest;
import com.be.entity.Activity;
import com.be.entity.User;
import com.be.enums.TourType;
import com.be.mapper.ActivityMapper;
import com.be.repository.ActivityRepository;
import com.be.service.impl.ActivityServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ActivityCreationTests {
    @Test void createsActivityWithoutRequiringOrCreatingDepartures() throws Exception {
        var request = new ActivityRequest();
        request.setTitle("Food tour"); request.setActivityType(TourType.FOODTOUR);
        request.setRegistrationDeadline(LocalDateTime.now().plusDays(2));
        request.setLocationName("HCM"); request.setAddress("District 1");
        request.setMinimumParticipants(2); request.setMaximumParticipants(20);
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertTrue(factory.getValidator().validate(request).isEmpty());
        }
        var repository = mock(ActivityRepository.class);
        when(repository.save(any(Activity.class))).thenAnswer(call -> {
            Activity activity = call.getArgument(0);
            assertTrue(activity.getDepartures().isEmpty());
            activity.setId(UUID.randomUUID());
            return activity;
        });
        var service = new ActivityServiceImpl(repository, new ActivityMapper(), null, null, null, null);
        var response = service.createActivity(request, null, null, new User());
        assertNotNull(response.getId());
        assertTrue(response.getDepartures().isEmpty());
        var json = new ObjectMapper().findAndRegisterModules().valueToTree(request);
        assertFalse(json.has("departures"));
    }
}
