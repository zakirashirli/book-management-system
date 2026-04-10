package com.book.library.service.interfaces;

import com.book.library.dto.BookDTO;
import com.book.library.dto.CreateBookRequest;

import java.util.List;

public interface BookService {
    BookDTO create(CreateBookRequest request);
    List<BookDTO> getAll();
    BookDTO getById(Long id);
    void delete(Long id);
}
