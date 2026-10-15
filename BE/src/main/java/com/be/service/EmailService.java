package com.be.service;

public interface EmailService {

    void sendHtmlEmail(String email, String subject, String html);

    void sendOtpEmail(
            String email,
            String otp
    );
}
