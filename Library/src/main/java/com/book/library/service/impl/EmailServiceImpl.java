package com.book.library.service.impl;

import com.book.library.service.interfaces.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtp(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Verification Code");
        message.setText("Your 6-digit OTP code is: " + otp + "\nIt expires in 5 minutes.");

        mailSender.send(message);
    }
}
