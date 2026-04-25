package com.book.library.service.impl;

import com.book.library.dto.auth.LoginRequest;
import com.book.library.dto.auth.RegisterRequest;
import com.book.library.entity.User;
import com.book.library.repository.UserRepository;
import com.book.library.service.interfaces.AuthService;
import com.book.library.service.jwt.JwtService;
import com.book.library.service.otp.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @Override
    public String register(RegisterRequest registerRequest) {

        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists!");
        }

        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();

        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEnabled(false);

        userRepository.save(user);
        otpService.generateAndSendOtp(user.getEmail());

        return "User Created! Verify your account.";
    }

    @Override
    public String verifyOtp(String email, String code) {
        otpService.verifyOtp(email, code);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setEnabled(true);
        userRepository.save(user);

        return "Account verified!";
    }


    @Override
    public String login(LoginRequest loginRequest) {

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid Password");
        }

        return jwtService.generateToken(user.getUsername());
    }
}
