package com.book.library.service.interfaces;

import com.book.library.dto.book.BookDTO;
import com.book.library.dto.book.CreateBookRequest;
import com.book.library.dto.book.UpdateBookRequest;
import com.book.library.filter.BookFilter;
import org.springframework.data.domain.Page;

import java.nio.file.AccessDeniedException;
import java.util.List;

public interface BookService {
    BookDTO create(CreateBookRequest createRequest);
    BookDTO update(Long id, UpdateBookRequest updateRequest) throws AccessDeniedException;
    Page<BookDTO> getAll(int page, int size, String sortBy, String direction);
    Page<BookDTO> filterBooks(int page, int size, String sortBy, String direction, BookFilter filter);
    BookDTO getById(Long id);
    List<BookDTO> getSellerBooks();
    void delete(Long id) throws AccessDeniedException;
}
