package com.book.library.service.interfaces;

import com.book.library.dto.book.BookDTO;
import com.book.library.dto.book.CreateBookRequest;
import com.book.library.dto.book.UpdateBookRequest;

import java.util.List;

public interface BookService {
    BookDTO create(CreateBookRequest createRequest);
    BookDTO update(Long id, UpdateBookRequest updateRequest);
    List<BookDTO> getAll();
    BookDTO getById(Long id);
    void delete(Long id);
}
