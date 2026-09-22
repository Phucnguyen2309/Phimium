package com.be.service.impl;

import com.be.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Override
    public void sendOtpEmail(String email, String otp) {
           try{
               MimeMessage message = mailSender.createMimeMessage();

               MimeMessageHelper helper = new MimeMessageHelper(message,true,"UTF-8");

               helper.setFrom(from);
               helper.setTo(email);

               helper.setSubject(
                       "PHIMIUM - Email Verification"
               );

               String html = """
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 500px;
                        margin: auto;
                        padding: 30px;
                    ">

                        <h2>Welcome to PHIMIUM 🎬</h2>

                        <p>
                            Use the verification code below
                            to verify your email address:
                        </p>

                        <div style="
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            text-align: center;
                            margin: 30px 0;
                        ">
                            %s
                        </div>

                        <p>
                            This code will expire in
                            <strong>5 minutes</strong>.
                        </p>

                        <p>
                            If you did not create a PHIMIUM
                            account, you can ignore this email.
                        </p>

                    </div>
                    """.formatted(otp);
               helper.setText(html, true);
               mailSender.send(message);
           } catch (MessagingException e) {
               throw new RuntimeException(
                       "Failed to send OTP email",
                       e
               );
           }
    }
}
