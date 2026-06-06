package com.book.library.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Username is required!")
    @Size(min = 3, max = 20, message = "Username should be in range 3-20!")
    private String username;
    @NotBlank(message = "Password is required!")
    @Size(min = 8, message = "Password must be at least 8 chars!")
    private String password;
}
