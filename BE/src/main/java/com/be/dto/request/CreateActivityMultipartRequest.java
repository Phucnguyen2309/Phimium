package com.be.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

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
}