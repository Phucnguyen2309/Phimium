package com.be;

import com.be.dto.request.UpdateActivityRequest;
import com.be.entity.Activity;
import com.be.mapper.ActivityMapper;
import com.be.repository.ActivityRepository;
import com.be.service.impl.ActivityServiceImpl;
import com.be.service.CloudinaryService;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class ActivityUpdateTests {
    @Test
    void preservesNullImagesAndReplacesOrAppendsNewImages() throws Exception {
        var activity = update(Arrays.asList(null, file("new-second"), new MockMultipartFile("images", new byte[0]), file("new-fourth")), file("new-cover"));
        assertEquals(List.of("first", "new-second", "third", "new-fourth"), activity.getImageUrls());
        assertEquals("new-cover", activity.getThumbnailUrl());
    }

    @Test
    void omittedGalleryAndThumbnailKeepOldImages() throws Exception {
        var activity = update(null, null);
        assertEquals(List.of("first", "second", "third"), activity.getImageUrls());
        assertEquals("old-cover", activity.getThumbnailUrl());
    }

    @Test
    void shorterOrEmptyGalleryKeepsUnspecifiedImages() throws Exception {
        assertEquals(List.of("new-first", "second", "third"),
                update(List.of(file("new-first")), null).getImageUrls());
        assertEquals(List.of("first", "second", "third"), update(List.of(), null).getImageUrls());
    }

    @Test
    void keptImageUrlsRemovesOthersThenAppliesImagesOnKeptList() throws Exception {
        assertEquals(List.of("third", "first"),
                update(null, null, List.of("third", "first")).getImageUrls());
        assertEquals(List.of("new-first", "second-replaced", "appended"),
                update(Arrays.asList(file("new-first"), file("second-replaced"), file("appended")), null,
                        List.of("first", "third")).getImageUrls());
        assertEquals(List.of(), update(null, null, List.of()).getImageUrls());
        assertEquals(List.of("second"), update(null, null, List.of("https://evil/x.jpg", "second", "second")).getImageUrls());
    }

    private MultipartFile file(String name) {
        return new MockMultipartFile("images", name, "image/jpeg", new byte[]{1});
    }

    private Activity update(List<MultipartFile> images, MultipartFile thumbnail) throws Exception {
        return update(images, thumbnail, null);
    }

    private Activity update(List<MultipartFile> images, MultipartFile thumbnail, List<String> keptImageUrls) throws Exception {
        var repository = mock(ActivityRepository.class);
        var activity = Activity.builder().id(UUID.randomUUID()).thumbnailUrl("old-cover")
                .imageUrls(new ArrayList<>(List.of("first", "second", "third"))).build();
        when(repository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(repository.save(activity)).thenReturn(activity);
        var cloudinary = mock(CloudinaryService.class);
        when(cloudinary.uploadImage(any(MultipartFile.class)))
                .thenAnswer(call -> ((MultipartFile) call.getArgument(0)).getOriginalFilename());
        var service = new ActivityServiceImpl(repository, new ActivityMapper(), cloudinary, null, null, null);
        var request = UpdateActivityRequest.builder().minimumParticipants(2).maximumParticipants(12)
                .keptImageUrls(keptImageUrls).build();
        service.updateActivity(activity.getId(), request, thumbnail, images);
        verify(repository).save(activity);
        return activity;
    }
}
