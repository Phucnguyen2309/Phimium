package com.be.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpgradeBuddyMultipartRequest {
    @Schema(description = "Buddy profile as an application/json part",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private UpgradeBuddyRequest request;

    @Schema(description = "Optional Buddy profile image", type = "string", format = "binary")
    private MultipartFile image;
}
