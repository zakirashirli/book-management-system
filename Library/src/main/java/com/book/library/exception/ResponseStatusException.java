package com.book.library.exception;

import org.springframework.http.HttpStatus;

public class ResponseStatusException extends RuntimeException {
    public ResponseStatusException(HttpStatus forbidden, String message) {
        super(message);
    }
}
