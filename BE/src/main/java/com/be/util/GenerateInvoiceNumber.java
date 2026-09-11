package com.be.util;

import java.util.UUID;

public class GenerateInvoiceNumber {
    private String generateInvoiceNumber(UUID registrationId){
        String random = UUID.randomUUID().toString()
                .replace("-","")
                .substring(0,8)
                .toUpperCase();

        return "REG_" + registrationId + "_" + random;
    }
}
