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
@AllArgsConstructor
@NoArgsConstructor
public class UpdateBookRequest {

    @NotBlank(message = "Title is required!")
    private String title;
    @NotBlank(message = "Author is required!")
    private String author;
    @NotNull(message = "Price is required!")
    @Positive(message = "Price should be greater than 0!")
    private Double price;
}
