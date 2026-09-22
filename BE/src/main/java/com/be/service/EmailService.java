package com.be.service;

public interface EmailService {

    void sendOtpEmail(
            String email,
            String otp
    );
}
