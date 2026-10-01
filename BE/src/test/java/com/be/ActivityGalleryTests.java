package com.be;

import com.be.dto.request.ActivityRequest;
import com.be.entity.Activity;
import com.be.entity.User;
import com.be.mapper.ActivityDetailMapper;
import com.be.mapper.ActivityMapper;
import com.be.repository.ActivityRepository;
import com.be.service.CloudinaryService;
import com.be.service.impl.ActivityServiceImpl;
import com.be.dto.request.CreateActivityMultipartRequest;
import io.swagger.v3.core.converter.ModelConverters;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ActivityGalleryTests {
    @Test void uploadsGalleryToCloudinaryAndReturnsUrlsInOrder() throws Exception {
        var repository = mock(ActivityRepository.class);
        var cloudinary = mock(CloudinaryService.class);
        var service = new ActivityServiceImpl(repository, new ActivityMapper(), cloudinary,
                null, new ActivityDetailMapper(), null);
        var request = new ActivityRequest();
        var thumbnail = new MockMultipartFile("image", "cover.jpg", "image/jpeg", new byte[]{1});
        var first = new MockMultipartFile("images", "first.jpg", "image/jpeg", new byte[]{2});
        var second = new MockMultipartFile("images", "second.jpg", "image/jpeg", new byte[]{3});
        var empty = new MockMultipartFile("images", new byte[0]);
        when(cloudinary.uploadImage(thumbnail)).thenReturn("https://res.cloudinary.com/demo/cover.jpg");
        when(cloudinary.uploadImage(first)).thenReturn("https://res.cloudinary.com/demo/first.jpg");
        when(cloudinary.uploadImage(second)).thenReturn("https://res.cloudinary.com/demo/second.jpg");
        UUID id = UUID.randomUUID();
        when(repository.save(any(Activity.class))).thenAnswer(call -> {
            Activity activity = call.getArgument(0);
            activity.setId(id);
            when(repository.findById(id)).thenReturn(Optional.of(activity));
            return activity;
        });

        service.createActivity(request, thumbnail, List.of(first, empty, second), new User());
        var detail = service.getActivityDetail(id);
        assertEquals("https://res.cloudinary.com/demo/cover.jpg", detail.getThumbnailUrl());
        assertEquals(List.of("https://res.cloudinary.com/demo/first.jpg",
                "https://res.cloudinary.com/demo/second.jpg"), detail.getImageUrls());
        verify(cloudinary, never()).uploadImage(empty);
    }

    @Test void missingGalleryReturnsEmptyArray() throws Exception {
        var activity = new ActivityMapper().toEntity(new ActivityRequest(), new User());
        var detail = new ActivityDetailMapper().toResponse(activity);
        assertTrue(new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(detail).get("imageUrls").isArray());
        assertEquals(List.of(), detail.getImageUrls());
    }

    @Test void failedUploadDoesNotSaveActivity() throws Exception {
        var repository = mock(ActivityRepository.class);
        var cloudinary = mock(CloudinaryService.class);
        var service = new ActivityServiceImpl(repository, new ActivityMapper(), cloudinary, null, null, null);
        var file = new MockMultipartFile("images", "photo.jpg", "image/jpeg", new byte[]{1});
        when(cloudinary.uploadImage(file)).thenThrow(new IOException("Upload failed"));
        assertThrows(IOException.class, () -> service.createActivity(new ActivityRequest(), null, List.of(file), new User()));
        verify(repository, never()).save(any());
    }

    @Test void swaggerDescribesGalleryAsBinaryFilesAndOmitsUrlsFromRequest() {
        var schemas = ModelConverters.getInstance().readAll(CreateActivityMultipartRequest.class);
        var openApi = new io.swagger.v3.oas.models.OpenAPI()
                .components(new io.swagger.v3.oas.models.Components().schemas(schemas));
        new com.be.config.OpenApiConfig().activityGalleryFileSchema().customise(openApi);
        var images = (io.swagger.v3.oas.models.media.Schema<?>) schemas.get("CreateActivityMultipartRequest")
                .getProperties().get("images");
        assertEquals("array", images.getType());
        assertEquals("string", images.getItems().getType());
        assertEquals("binary", images.getItems().getFormat());
        assertFalse(schemas.get("ActivityRequest").getProperties().containsKey("imageUrls"));
    }
}
