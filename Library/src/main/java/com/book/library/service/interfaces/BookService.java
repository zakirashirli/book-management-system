package com.book.library.service.interfaces;

import com.book.library.entity.Book;

import java.util.List;

public interface BookService {
    Book create(Book book);
    List<Book> getAll();
    Book getById(Long id);
    void delete(Long id);
}
