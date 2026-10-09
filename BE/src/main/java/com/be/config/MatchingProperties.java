package com.be.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Data
@Component
@Validated
@ConfigurationProperties(prefix = "matching")
public class MatchingProperties {
    @Min(1) @Max(60) private int resultMinutes = 10;
    @Min(1) @Max(10) private int maxResults = 3;
    @Min(1) @Max(30) private int candidateLimit = 12;
    @Min(1) @Max(200) private int buddyLimit = 50;
    @Min(1) @Max(100) private int requestsPerMinute = 6;
    @Valid private Gemini gemini = new Gemini();
    @Data
    public static class Gemini {
        private String apiKey = "";
        @Size(max = 100) @Pattern(regexp = "[a-zA-Z0-9._-]*") private String model = "";
        private String baseUrl = "https://generativelanguage.googleapis.com";
        @Min(100) @Max(60000) private int timeoutMillis = 20000;
        @Min(1) @Max(20) private int maxConcurrent = 4;
    }
}
