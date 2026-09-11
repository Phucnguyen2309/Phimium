package com.be.util;

import com.be.config.SePayProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SePaySignatureUtil {
    private final SePayProperties sePayProperties;

    public String sign(Map<String, String> fields){
        List<String> order = List.of(
                "order_amount",
                "merchant",
                "currency",
                "operation",
                "order_description",
                "order_invoice_number",
                "customer_id",
                "payment_method",
                "success_url",
                "error_url",
                "cancel_url"
        );

        String data = order.stream()
                .filter(fields :: containsKey)
                .map(key -> key + "=" + fields.get(key))
                .collect(Collectors.joining(","));
        try{
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(
                    sePayProperties.getSecretKey().getBytes(StandardCharsets.UTF_8), "HmacSHA256"
            );
            mac.init(key);
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(digest);

        }catch (GeneralSecurityException e){
            throw new IllegalStateException(
                    "Cannot generate SePay signature",
                    e
            );
        }
    }
}
