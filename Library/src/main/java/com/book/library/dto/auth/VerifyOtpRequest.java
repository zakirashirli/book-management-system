package com.book.library.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequest {

    @NotBlank(message = "Email cannot be empty!")
    @Email(message = "Email format is invalid!")
    private String email;
    @NotBlank(message = "OTP code cannot be empty!")
    @Pattern(regexp = "\\d{6}", message = "OTP code must be 6-digits number!")
    private String code;

}
