package com.book.library.service.impl;

import com.book.library.dto.book.BookDTO;
import com.book.library.dto.book.CreateBookRequest;
import com.book.library.dto.book.UpdateBookRequest;
import com.book.library.entity.Book;
import com.book.library.entity.User;
import com.book.library.entity.enums.Role;
import com.book.library.exception.BookNotFoundException;
import com.book.library.exception.UserNotFoundException;
import com.book.library.filter.BookFilter;
import com.book.library.filter.BookSpecification;
import com.book.library.repository.BookRepository;
import com.book.library.repository.UserRepository;
import com.book.library.service.interfaces.BookService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public BookServiceImpl(BookRepository bookRepository, UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    // to-do
    @CacheEvict(value = "books", allEntries = true)
    @Override
    public BookDTO create(CreateBookRequest request) {
        User currentUser = getCurrentUser();

        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPrice(request.getPrice());
        book.setAmount(request.getAmount());
        book.setSeller(currentUser);

        Book saved = bookRepository.save(book);

        return mapToDTO(saved);
    }

    @CacheEvict(value = "books", allEntries = true)
    @Override
    public BookDTO update(Long id, UpdateBookRequest updateRequest) throws AccessDeniedException{
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Not Found!"));

        checkOwnerOrAdmin(book);

        book.setTitle(updateRequest.getTitle());
        book.setAuthor(updateRequest.getAuthor());
        book.setPrice(updateRequest.getPrice());
        book.setAmount(updateRequest.getAmount());

        Book updated = bookRepository.save(book);

        return mapToDTO(updated);
    }

    @Cacheable(value = "books")
    @Override
    public Page<BookDTO> getAll(
            int page,
            int size,
            String sortBy,
            String direction
    ) {

        System.out.println("MYSQL");

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
    public List<BookDTO> getSellerBooks() {
        User currentUser = getCurrentUser();

        return bookRepository.findBySeller(currentUser)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // to-do
    @CacheEvict(value = "books", allEntries = true)
    @Override
    public void delete(Long id) throws AccessDeniedException {
        User currentUser = getCurrentUser();
        Book book = bookRepository.findById(id)
                        .orElseThrow(() -> new BookNotFoundException("Book not found!"));

        checkOwnerOrAdmin(book);
        bookRepository.delete(book);
    }


    private void checkOwnerOrAdmin(Book book) throws AccessDeniedException{
        User currentUser = getCurrentUser();

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = book.getSeller() != null && book.getSeller().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You can manage only own books!");
        }
    }


    private User getCurrentUser() {
        String login = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(login)
                .or(() -> userRepository.findByUsername(login))
                .orElseThrow(() -> new UserNotFoundException("Current User not found"));
    }

    private BookDTO mapToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setPrice(book.getPrice());
        dto.setAmount(book.getAmount());

        return dto;
    }
}
