package com.book.library.controller;

import com.book.library.dto.book.BookDTO;
import com.book.library.dto.book.CreateBookRequest;
import com.book.library.dto.book.UpdateBookRequest;
import com.book.library.filter.BookFilter;
import com.book.library.service.interfaces.BookService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/api/books")
@Tag(name = "Book management APIs", description = "APIs for book management")
public class BookRestController {

    private final BookService bookService;

    public BookRestController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public BookDTO create(@RequestBody @Valid CreateBookRequest request) {
        return bookService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN', 'SELLER')")
    public Page<BookDTO> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return bookService.getAll(page, size, sortBy, direction);
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('USER','ADMIN', 'SELLER')")
    public Page<BookDTO> filterBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        BookFilter filter = new BookFilter();
        filter.setTitle(title);
        filter.setAuthor(author);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);

        return bookService.filterBooks(page, size, sortBy, direction, filter);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN', 'SELLER')")
    public BookDTO getById(@PathVariable Long id){
        return bookService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public BookDTO update(@PathVariable Long id, @RequestBody @Valid UpdateBookRequest updateRequest) throws AccessDeniedException {
        return bookService.update(id, updateRequest);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public void deleteById(@PathVariable Long id) throws AccessDeniedException {
        bookService.delete(id);
    }
}
