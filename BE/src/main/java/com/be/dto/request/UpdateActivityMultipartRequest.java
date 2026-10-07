package com.be.dto.request;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class UpdateActivityMultipartRequest {
    @Schema(description = "Activity information")
    private UpdateActivityRequest request;

    @Schema(description = "New thumbnail; omit to keep the current image", type = "string", format = "binary")
    private MultipartFile image;

    @ArraySchema(schema = @Schema(type = "string", format = "binary"),
            arraySchema = @Schema(description = "New gallery images in order; empty files keep the existing image at that position"))
    private List<MultipartFile> images;
}
