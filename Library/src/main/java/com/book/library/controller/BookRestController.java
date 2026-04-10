package com.book.library.controller;

import com.book.library.dto.BookDTO;
import com.book.library.dto.CreateBookRequest;
import com.book.library.entity.Book;
import com.book.library.service.interfaces.BookService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@Tag(name = "Book management APIs", description = "APIs for book management")
public class BookRestController {

    private final BookService bookService;

    public BookRestController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public BookDTO create(@RequestBody @Valid CreateBookRequest request) {
        return bookService.create(request);
    }

    @GetMapping
    public List<BookDTO> getAll() {
        return bookService.getAll();
    }

    @GetMapping("/{id}")
    public BookDTO getById(@PathVariable Long id) {
        return bookService.getById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        bookService.delete(id);
    }

}
