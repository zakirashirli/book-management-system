package com.book.library.service.interfaces;

import com.book.library.dto.auth.AuthResponse;
import com.book.library.dto.auth.ForgotPasswordRequest;
import com.book.library.dto.auth.LoginRequest;
import com.book.library.dto.auth.RegisterRequest;
import com.book.library.dto.auth.RefreshTokenRequest;
import com.book.library.dto.auth.ResetPasswordRequest;

public interface AuthService {
    String register(RegisterRequest registerRequest);
    String verifyOtp(String email, String code);
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse refreshToken(RefreshTokenRequest request);
    String logout(RefreshTokenRequest request);
    String forgotPassword(ForgotPasswordRequest request);
    String resetPassword(ResetPasswordRequest request);
}
