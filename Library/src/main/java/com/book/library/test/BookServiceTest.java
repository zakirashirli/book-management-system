package com.book.library.test;

import com.book.library.dto.book.BookDTO;
import com.book.library.dto.book.CreateBookRequest;
import com.book.library.entity.Book;
import com.book.library.repository.BookRepository;
import com.book.library.service.impl.BookServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
public class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookServiceImpl bookService;

    @Test
    void create_saveBook(){

        CreateBookRequest request = new CreateBookRequest();
        request.setTitle("Java");

        Book book = new Book();
        book.setTitle("Java");

        when(bookRepository.save(any())).thenReturn(book);

        BookDTO result = bookService.create(request);
        assertEquals("Java", result.getTitle());
    }
}
