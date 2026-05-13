package com.book.library.service.impl;

import com.book.library.dto.book.BookDTO;
import com.book.library.dto.book.CreateBookRequest;
import com.book.library.dto.book.UpdateBookRequest;
import com.book.library.entity.Book;
import com.book.library.exception.BookNotFoundException;
import com.book.library.filter.BookFilter;
import com.book.library.filter.BookSpecification;
import com.book.library.repository.BookRepository;
import com.book.library.service.interfaces.BookService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;

    public BookServiceImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public BookDTO create(CreateBookRequest request) {
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPrice(request.getPrice());

        Book saved = bookRepository.save(book);

        return mapToDTO(saved);
    }

    @Override
    public BookDTO update(Long id, UpdateBookRequest updateRequest) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Not Found!"));

        book.setTitle(updateRequest.getTitle());
        book.setAuthor(updateRequest.getAuthor());
        book.setPrice(updateRequest.getPrice());

        Book updated = bookRepository.save(book);

        return mapToDTO(updated);
    }

    @Override
    public Page<BookDTO> getAll(
            int page,
            int size,
            String sortBy,
            String direction
    ) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> books = bookRepository.findAll(pageable);

        return books.map(this::mapToDTO);
    }

    @Override
    public Page<BookDTO> filterBooks(
            int page,
            int size,
            String sortBy,
            String direction,
            BookFilter filter
    ) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> books = bookRepository.findAll(
                BookSpecification.filterBooks(filter),
                pageable
        );

        return books.map(this::mapToDTO);
    }

    @Override
    public BookDTO getById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Book not found!"));

        return mapToDTO(book);
    }

    @Override
    public void delete(Long id) {
        bookRepository.deleteById(id);
    }


    private BookDTO mapToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setPrice(book.getPrice());
        return dto;
    }
}
