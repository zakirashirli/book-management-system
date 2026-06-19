package com.book.library.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Email cannot be empty!")
    @Email(message = "Email format is invalid!")
    private String email;

    @NotBlank(message = "OTP code is required!")
    @Pattern(regexp = "\\d{6}", message = "OTP code must be 6 digits!")
    private String code;

    @NotBlank(message = "Password is required!")
    @Size(min = 8, message = "Password must include at least 8 chars!")
    private String newPassword;
}
