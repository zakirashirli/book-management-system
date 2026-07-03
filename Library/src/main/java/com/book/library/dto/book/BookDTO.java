package com.book.library.dto.book;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO implements Serializable {
    private Long id;
    private String title;
    private String author;
    private Double price;
    private Integer amount;
    private Long sellerId;
    private String sellerUsername;
}
