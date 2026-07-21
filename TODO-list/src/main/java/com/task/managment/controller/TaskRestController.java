package com.task.managment.controller;

import com.task.managment.model.dto.CreateTaskRequest;
import com.task.managment.model.dto.TaskDTO;
import com.task.managment.model.dto.UpdateTaskRequest;
import com.task.managment.model.enums.Priority;
import com.task.managment.model.enums.TaskStatus;
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

    @GetMapping("/status/{status}")
    public List<TaskDTO> getByStatus(@PathVariable TaskStatus status) {
        return service.getByStatus(status);
    }

    @GetMapping("/priority/{priority}")
    public List<TaskDTO> getByPriority(@PathVariable Priority priority) {
        return service.getByPriority(priority);
    }

    @GetMapping("/search/{search}")
    public List<TaskDTO> search(@RequestParam String title) {
        return service.searchByTitle(title);
    }

    @PutMapping("/{id}")
    public TaskDTO update(@PathVariable Long id, @Valid @RequestBody UpdateTaskRequest request){
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id){
        service.delete(id);
    }


}
