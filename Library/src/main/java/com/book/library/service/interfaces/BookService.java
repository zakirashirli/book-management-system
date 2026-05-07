package com.book.library.service.interfaces;

import com.book.library.dto.book.BookDTO;
import com.book.library.dto.book.CreateBookRequest;
import com.book.library.dto.book.UpdateBookRequest;
import org.springframework.data.domain.Page;

public interface BookService {
    BookDTO create(CreateBookRequest createRequest);
    BookDTO update(Long id, UpdateBookRequest updateRequest);
    Page<BookDTO> getAll(int page, int size, String sortBy, String direction);
    BookDTO getById(Long id);
    void delete(Long id);
}
