package com.be.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springdoc.core.customizers.OpenApiCustomizer;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.BinarySchema;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenApiCustomizer activityGalleryFileSchema() {
        // Model resolution can discard the binary format on MultipartFile list items.
        // Set it on the final schema so Swagger UI renders a multiple-file input.
        return openApi -> {
            if (openApi.getComponents() == null || openApi.getComponents().getSchemas() == null) {
                return;
            }
            for (String schemaName : java.util.List.of("CreateActivityMultipartRequest", "UpdateActivityMultipartRequest")) {
                var multipart = openApi.getComponents().getSchemas().get(schemaName);
                if (multipart != null) {
                    multipart.addProperty("images", new ArraySchema().items(new BinarySchema())
                            .description("Gallery files in display order; empty files preserve existing images on update"));
                }
            }
        };
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PHIMIUM API ")
                        .version("v1")
                        .description("API documentation for PHIMIUM AI backend")
                        .contact(new Contact().name("PHIMIUM Team"))
                )
                .addSecurityItem(new SecurityRequirement().addList("bearAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        )
                )
                ;
    }
}
