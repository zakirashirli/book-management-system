package com.book.library.filter;

import lombok.Data;

@Data
public class BookFilter {
    private String title;
    private String author;
    private Double minPrice;
    private Double maxPrice;
}
