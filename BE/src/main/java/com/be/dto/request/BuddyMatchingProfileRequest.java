package com.be.dto.request;

import com.be.enums.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.*;

@Data
public class BuddyMatchingProfileRequest {
    @NotNull @Size(max = 16)
    private Set<@NotNull MatchingTag> interests = new LinkedHashSet<>();
    @NotNull @Size(max = 20)
    private Set<@NotBlank @Size(max = 100) String> skills = new LinkedHashSet<>();
    @NotNull @Size(max = 10)
    private Set<@NotBlank @Pattern(regexp = "[a-zA-Z]{2,3}") String> languages = new LinkedHashSet<>();
    private GuidingStyle guidingStyle;
}
