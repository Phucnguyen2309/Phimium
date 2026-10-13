package com.be.dto.request;

import com.be.enums.GuidingStyle;
import com.be.enums.MatchingTag;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@SuperBuilder
public class BuddyMatchingProfileRequest {
    @NotNull
    @Size(max = 16)
    @Builder.Default
    @Schema(description = "Shared matching interests as an array of tag codes",
            example = "[\"PHOTOGRAPHY\",\"RETRO\"]")
    private Set<@NotNull MatchingTag> interests = new LinkedHashSet<>();

    @NotNull
    @Size(max = 20)
    @Builder.Default
    @Schema(description = "Profile skills as an array of strings",
            example = "[\"Portrait photography\",\"Local history\"]")
    private Set<@NotBlank @Size(max = 100) String> skills = new LinkedHashSet<>();

    @NotNull
    @Size(max = 10)
    @Builder.Default
    @Schema(description = "Array of two or three letter language codes, saved in uppercase",
            example = "[\"VI\",\"EN\"]")
    private Set<@NotBlank @Pattern(regexp = "[a-zA-Z]{2,3}") String> languages = new LinkedHashSet<>();

    @Schema(example = "PHOTOGRAPHY_FOCUSED")
    private GuidingStyle guidingStyle;
}
