package com.book.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateBookRequest {

    @NotBlank(message = "Title cannot be empty!")
    private String title;

    @NotBlank(message = "Author cannot be empty!")
    private String author;

    @NotNull(message = "Price is required!")
    @Positive(message = "Price must be greater than 0!")
    private Double price;

    public CreateBookRequest() {
    }

    public CreateBookRequest(String title, String author, Double price) {
        this.title = title;
        this.author = author;
        this.price = price;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
