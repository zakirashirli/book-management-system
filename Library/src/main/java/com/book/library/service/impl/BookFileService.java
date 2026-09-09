package com.book.library.service.impl;

import com.book.library.entity.Book;
import com.book.library.entity.User;
import com.book.library.entity.enums.Role;
import com.book.library.exception.BookNotFoundException;
//import com.book.library.exception.ResponseStatusException;
import org.springframework.web.server.ResponseStatusException;
import com.book.library.exception.UserNotFoundException;
import com.book.library.repository.BookRepository;
import com.book.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;

@Service
public class BookFileService {

    private static final long MAX_SIZE = 10L * 1024 * 1024;

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final Path uploadDir;


    public BookFileService(
            BookRepository bookRepository,
            UserRepository userRepository,
            @Value("${app.upload-dir}") String uploadDir
    ) throws IOException {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();

        Files.createDirectories(this.uploadDir);
    }

    public void upload(
            Long bookId,
            MultipartFile file,
            Authentication authentication
    ) throws IOException {

        Book book = findBook(bookId);

        String login = authentication.getName();

        User currentUser = userRepository.findByEmail(login)
                .or(() -> userRepository.findByUsername(login))
                .orElseThrow(() -> new UserNotFoundException("Current User not found!"));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN; // if admin T else F
        boolean isOwner = book.getSeller() != null
                && book.getSeller().getId().equals(currentUser.getId()); // false


        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only Owner and Admin can add files!!!"
            );

        }

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Choose correct file"
            );
        }

        if (file.getSize() > MAX_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Max size is 10MB"
            );
        }

        try (InputStream input = file.getInputStream()) {
            byte[] signature = input.readNBytes(5);
            byte[] expected = "%PDF-".getBytes(StandardCharsets.US_ASCII); // asdfasdf/145234654.pdf

            if (!Arrays.equals(signature,expected)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only PDFs!"
                );
            }
        }

        Path target = filePath(bookId);
        Path temporary = Files.createTempFile(uploadDir, "upload-", ".tmp");

        try {
            try (InputStream input = file.getInputStream()) {
                Files.copy(
                        input,
                        temporary,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            Files.move(
                    temporary,
                    target,
                    StandardCopyOption.ATOMIC_MOVE,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } finally {
            Files.deleteIfExists(temporary);
        }
    }


    public Resource download(Long bookId) throws IOException {
        findBook(bookId);

        Path path = filePath(bookId);

        if (!Files.isRegularFile(path)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "For this book files not uploaded yet!"
            );
        }

        return new UrlResource(path.toUri());
    }



    private Book findBook(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Book not found!"));
    }

    private Path filePath(Long bookId) {
        return uploadDir.resolve(bookId + ".pdf");
    }
}
