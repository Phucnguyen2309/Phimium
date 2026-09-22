package com.be.service;

import com.be.entity.User;

public interface EmailOtpService {
 void sendOtp(User user);

 void verifyOtp(String email,String otp);

 void resendOtp(String email);
}
