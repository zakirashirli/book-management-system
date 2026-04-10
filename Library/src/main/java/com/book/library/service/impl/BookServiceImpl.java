package com.book.library.service.impl;

import com.book.library.dto.BookDTO;
import com.book.library.dto.CreateBookRequest;
import com.book.library.entity.Book;
import com.book.library.exception.BookNotFoundException;
import com.book.library.repository.BookRepository;
import com.book.library.service.interfaces.BookService;
import org.springframework.stereotype.Service;

import java.util.List;

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
    public List<BookDTO> getAll() {
        return bookRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
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
