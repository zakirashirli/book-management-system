package com.book.library.service.interfaces;

import com.book.library.dto.auth.LoginRequest;
import com.book.library.dto.auth.RegisterRequest;

public interface AuthService {
    String register(RegisterRequest registerRequest);
    String verifyOtp(String email, String code);
    String login(LoginRequest loginRequest);
}
