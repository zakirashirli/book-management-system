package com.book.library.controller;

import com.book.library.service.impl.BookFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/books")
public class BookFileRestController {

    private final BookFileService bookFileService;


    @PostMapping(
            value = "/{id}/file",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> upload(
            @PathVariable("id") Long id,
            @RequestParam("file")MultipartFile file,
            Authentication authentication
    ) throws IOException {
        bookFileService.upload(id, file, authentication);

        return ResponseEntity.ok(Map.of(
                "message", "File loaded successfully!",
                "downloadUrl", "/api/books" + id + "/file"
        ));
    }

    @GetMapping("/{id}/file")
    @PreAuthorize("hasAnyRole('USER','SELLER', 'ADMIN')")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException{
        Resource resource = bookFileService.download(id);

        String disposition = ContentDisposition.attachment()
                .filename("book-" + id + ".pdf")
                .build()
                .toString();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }
}
