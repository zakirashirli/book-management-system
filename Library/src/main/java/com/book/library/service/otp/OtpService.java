package com.book.library.service.otp;

import com.book.library.entity.Otp;
import com.book.library.exception.BadRequestException;
import com.book.library.repository.OtpRepository;
import com.book.library.service.interfaces.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor

public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    private static final SecureRandom random = new SecureRandom();

    public void generateAndSendOtp(String email) {
        otpRepository.deleteByEmail(email);

        int codeInt = 100000 + random.nextInt(900000);
        String code = String.valueOf(codeInt);

        Otp otp = new Otp();
        otp.setEmail(email);
        otp.setCode(code);
        otp.setExpirationTime(System.currentTimeMillis() + 5 * 60 * 1000);

        otpRepository.save(otp);

        emailService.sendOtp(email, code);
    }

    @Transactional
    public boolean verifyOtp(String email, String inputCode) {

        Otp otp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("OTP not found!"));

        if (otp.getExpirationTime() < System.currentTimeMillis()) {
            throw new BadRequestException("OTP expired!");
        }

        if (!otp.getCode().equals(inputCode)) {
            throw new BadRequestException("Invalid OTP!");
        }

        otpRepository.deleteByEmail(email);

        return true;
    }
}
