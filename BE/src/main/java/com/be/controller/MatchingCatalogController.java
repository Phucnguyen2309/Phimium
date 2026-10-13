package com.be.controller;

import com.be.dto.response.ApiResponse;
import com.be.enums.GuidingStyle;
import com.be.enums.MatchingTag;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Map;

@RestController
@Tag(name = "Matching catalog")
public class MatchingCatalogController {

    @GetMapping("/api/matching/tags")
    public ApiResponse<Map<String, Object>> tags() {
        return ApiResponse.success("Success", Map.of("tags", Arrays.stream(MatchingTag.values())
                .map(t -> Map.of("code", t.name(), "category", t.getCategory(),
                        "labelVi", t.getLabelVi(), "labelEn", t.getLabelEn())).toList(),
                "guidingStyles", GuidingStyle.values()));
    }
}
