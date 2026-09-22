package com.be.service.impl;

import com.be.entity.EmailOtp;
import com.be.entity.User;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.repository.EmailOtpRepository;
import com.be.repository.UserRepository;
import com.be.service.EmailOtpService;
import com.be.service.EmailService;
import com.be.util.OtpUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailOtpServiceImpl implements EmailOtpService {
    private final EmailOtpRepository emailOtpRepository;

    private final UserRepository userRepository;

    private final EmailService emailService;

    private final PasswordEncoder passwordEncoder;
//    @Override
//    @Transactional
//    public void sendOtp(User user) {
//       emailOtpRepository.findByUser(user).ifPresent(emailOtpRepository::delete);
//
//       String otp = OtpUtils.generateOtp();
//
//       EmailOtp emailOtp = EmailOtp.builder()
//               .user(user)
//               .otpHash(passwordEncoder.encode(otp))
//               .expireAt(LocalDateTime.now().plusMinutes(5))
//               .attempts(0)
//               .lastSentAt(LocalDateTime.now())
//               .build();
//       emailOtpRepository.save(emailOtp);
//
//       emailService.sendOtpEmail(user.getEmail(),otp);
//    }

    @Override
    @Transactional
    public void sendOtp(User user) {
        EmailOtp emailOtp = emailOtpRepository.findByUser(user)
                .orElseGet(() -> EmailOtp.builder()
                        .user(user)
                        .build());

        String otp = OtpUtils.generateOtp();

        emailOtp.setOtpHash(passwordEncoder.encode(otp));
        emailOtp.setExpireAt(LocalDateTime.now().plusMinutes(5));
        emailOtp.setAttempts(0);
        emailOtp.setLastSentAt(LocalDateTime.now());

        emailOtpRepository.save(emailOtp);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public void verifyOtp(String email, String otp) {
       User user = userRepository.findByEmail(email)
               .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
       if(Boolean.TRUE.equals(user.getEmailVerified())){
           return;
       }
       EmailOtp emailOtp = emailOtpRepository.findByUser(user)
               .orElseThrow(() -> new AppException(ErrorCode.OTP_NOT_FOUND));

       if(emailOtp.getExpireAt().isBefore(LocalDateTime.now())){
           emailOtpRepository.delete(emailOtp);

           throw new AppException(ErrorCode.OTP_EXPIRE);
       }
       if(emailOtp.getAttempts() >= 5){
           emailOtpRepository.delete(emailOtp);
           throw new AppException(ErrorCode.OTP_MANY_ATTEMPTS);
       }

       boolean matches = passwordEncoder.matches(otp, emailOtp.getOtpHash());

       if(!matches){
           emailOtp.setAttempts(emailOtp.getAttempts() + 1);
           emailOtpRepository.save(emailOtp);
           throw new AppException(ErrorCode.OTP_INVALID);
       }
       user.setEmailVerified(true);
       userRepository.save(user);
       emailOtpRepository.delete(emailOtp);
    }

    @Override
    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if(Boolean.TRUE.equals(user.getEmailVerified())){
            throw new AppException(ErrorCode.OTP_ALREADY_EXIST);
        }
        emailOtpRepository.findByUser(user).ifPresent(existingOtp ->{
            if(existingOtp.getLastSentAt().plusSeconds(60).isAfter(LocalDateTime.now())){
                throw new AppException(ErrorCode.OTP_RESEND);
            }
        });
        sendOtp(user);
    }
}
