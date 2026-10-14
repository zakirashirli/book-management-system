package com.book.library.service.impl;

import com.book.library.dto.auth.*;
import com.book.library.entity.RefreshToken;
import com.book.library.entity.User;
import com.book.library.entity.enums.Role;
import com.book.library.exception.BadRequestException;
import com.book.library.exception.UserNotFoundException;
import com.book.library.repository.RefreshTokenRepository;
import com.book.library.repository.UserRepository;
import com.book.library.service.interfaces.AuthService;
import com.book.library.service.jwt.JwtService;
import com.book.library.service.otp.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final long REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000L;
    

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @Override
    public String register(RegisterRequest registerRequest) {

        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new UserNotFoundException("Username already exists!");
        }

        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists!");
        }

        Role role = registerRequest.getRole() == null ? Role.USER : registerRequest.getRole();

        if (role == Role.ADMIN) {
            throw new BadRequestException("Cannot Register as ADMIN");
        }
        
        User user = User.builder()
               .username(registerRequest.getUsername())
               .email(registerRequest.getEmail())
               .password(passwordEncoder.encode(registerRequest.getPassword()))
               .role(role)
               .enabled(false)
               .build();

        userRepository.save(user);
        otpService.generateAndSendOtp(user.getEmail());

        return "User Created! Verify your account.";
    }

    @Override
    public String verifyOtp(String email, String code) {
        otpService.verifyOtp(email, code);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        user.setEnabled(true);
        userRepository.save(user);

        return "Account verified!";
    }


    @Override
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
            throw new BadRequestException("Invalid Password");
        }

        if(!user.isEnabled()) {
            throw new BadRequestException("Account not verified!");
        }

        refreshTokenRepository.deleteByUser(user);

        String accessToken = jwtService.generateToken(user.getUsername(), user.getRole().name());
        String refreshToken = UUID.randomUUID().toString();

        RefreshToken token = new RefreshToken();
        token.setToken(refreshToken);
        token.setUser(user);
        token.setExpirationTime(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION);
        token.setRevoked(false);

        refreshTokenRepository.save(token);

        return new AuthResponse(accessToken, refreshToken, "Bearer");
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token!"));

        if (refreshToken.isRevoked()) {
            throw new BadRequestException("Revoked refresh token!");
        }

        if (refreshToken.getExpirationTime() < System.currentTimeMillis()) {
            throw new BadRequestException("Expired refresh token!");
        }

        User user = refreshToken.getUser();
        String accessToken = jwtService.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponse(accessToken, refreshToken.getToken(), "Bearer");
    }

    @Override
    public String logout(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token!"));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return "Logged out successfully!";
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        otpService.generateAndSendOtp(user.getEmail());

        return "OTP sent to email!";
    }

    @Override
    public String resetPassword(ResetPasswordRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getCode());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password changed successfully!";
    }
}
