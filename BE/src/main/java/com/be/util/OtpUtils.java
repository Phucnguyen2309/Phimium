package com.be.util;

import java.security.SecureRandom;

public class OtpUtils {

    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateOtp() {
        int otp =
                100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}
