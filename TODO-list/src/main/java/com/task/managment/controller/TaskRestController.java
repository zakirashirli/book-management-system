package com.task.managment.controller;

import com.task.managment.model.dto.CreateTaskRequest;
import com.task.managment.model.dto.TaskDTO;
import com.task.managment.service.interfaces.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskRestController {

    private final TaskService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskDTO create(@Valid @RequestBody CreateTaskRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<TaskDTO> getAll() {
        return service.getAll();
    }

}
