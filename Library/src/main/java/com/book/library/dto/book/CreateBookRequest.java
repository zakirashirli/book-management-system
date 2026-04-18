package com.book.library.dto.book;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookRequest {

    @NotBlank(message = "Title cannot be empty!")
    private String title;

    @NotBlank(message = "Author cannot be empty!")
    private String author;

    @NotNull(message = "Price is required!")
    @Positive(message = "Price must be greater than 0!")
    private Double price;
}
