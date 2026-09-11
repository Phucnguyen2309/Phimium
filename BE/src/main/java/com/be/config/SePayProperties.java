package com.be.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "sepay")
@Data
public class SePayProperties {
    private String merchantId;
    private String secretKey;

    private String checkoutUrl;
    private String apiUrl;

    private String successUrl;
    private String errorUrl;
    private String cancelUrl;

}
