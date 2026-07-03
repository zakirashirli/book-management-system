package com.book.library.dto.auth;

import com.book.library.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Username is required!")
    @Size(min = 3, max = 20, message = "Username should be in range 3-20!")
    private String username;
    @NotBlank(message = "Email cannot be empty!")
    @Email(message = "Email format is invalid!")
    private String email;
    @NotBlank(message = "Password is required!")
    @Size(min = 8, message = "Password must include at least 8 chars!")
    private String password;
    private Role role;
}
