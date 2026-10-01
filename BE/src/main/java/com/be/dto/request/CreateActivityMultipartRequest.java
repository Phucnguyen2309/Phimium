package com.be.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import io.swagger.v3.oas.annotations.media.ArraySchema;

@Data
public class CreateActivityMultipartRequest {

    @Schema(description = "Activity information")
    private ActivityRequest request;

    @Schema(
            description = "Activity thumbnail",
            type = "string",
            format = "binary"
    )
    private MultipartFile image;

    @ArraySchema(schema = @Schema(type = "string", format = "binary"),
            arraySchema = @Schema(description = "Gallery images to upload to Cloudinary, in display order"))
    private List<MultipartFile> images;
}
