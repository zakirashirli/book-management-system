package com.task.managment.service.impl;

import com.task.managment.exception.TaskNotFoundException;
import com.task.managment.model.dto.CreateTaskRequest;
import com.task.managment.model.dto.TaskDTO;
import com.task.managment.model.dto.UpdateTaskRequest;
import com.task.managment.model.entity.Task;
import com.task.managment.model.enums.Priority;
import com.task.managment.model.enums.TaskStatus;
import com.task.managment.repo.TaskRepo;
import com.task.managment.service.interfaces.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepo repo;

    @CacheEvict(value = "tasks", allEntries = true)
    @Override
    public TaskDTO create(CreateTaskRequest request) {

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());

        Task savedTask = repo.save(task);

        return mapToDTo(savedTask);
    }

    @CacheEvict(value = "tasks", allEntries = true)
    @Override
    public TaskDTO update(Long id, UpdateTaskRequest request) {

        Task task = repo.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());

        Task updatedTask = repo.save(task);

        return mapToDTo(updatedTask);
    }

    @Override
    public TaskDTO getById(Long id) {
        return null;
    }

    @CacheEvict(value = "tasks", allEntries = true)
    @Override
    public TaskDTO start(Long id) {
        Task task = repo.findTaskById(id);

        if (task.getStatus() != TaskStatus.TODO) {
            throw new IllegalStateException("This task in progress or done!");
        }

        task.setStatus(TaskStatus.IN_PROGRESS);

        Task updatedTask = repo.save(task);

        return mapToDTo(updatedTask);
    }

    @CacheEvict(value = "tasks", allEntries = true)
    @Override
    public TaskDTO complete(Long id) {
        Task task = repo.findTaskById(id);

        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new IllegalStateException("This task already done!");
        }

        task.setStatus(TaskStatus.DONE);

        Task updatedTask = repo.save(task);

        return mapToDTo(updatedTask);
    }

    @CacheEvict(value = "tasks", allEntries = true)
    @Override
    public TaskDTO cancel(Long id) {
        Task task = repo.findTaskById(id);

        task.setStatus(TaskStatus.TODO);

        Task updatedTask = repo.save(task);

        return mapToDTo(updatedTask);
    }

    @Cacheable(value = "tasks")
    @Override
    public List<TaskDTO> getAll() {

        System.out.println("Getting From DB");

        return repo
                .findAll()
                .stream()
                .map(this::mapToDTo)
                .toList();
    }

    @Override
    public List<TaskDTO> getByStatus(TaskStatus status) {
        return repo
                .findByStatus(status)
                .stream()
                .map(this::mapToDTo)
                .toList();
    }

    @Override
    public List<TaskDTO> getByPriority(Priority priority) {
        return repo
                .findByPriority(priority)
                .stream()
                .map(this::mapToDTo)
                .toList();
    }

    @Override
    public List<TaskDTO> searchByTitle(String title) {
        return repo
                .findByTitleContainingIgnoreCase(title)
                .stream()
                .map(this::mapToDTo)
                .toList();
    }

    @CacheEvict(value = "tasks", allEntries = true)
    @Override
    public void delete(Long id) {
        Task task = repo.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));

        repo.delete(task);
    }

    private TaskDTO mapToDTo(Task task) {

        TaskDTO dto = new TaskDTO();

        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDeadline(task.getDeadline());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());

        return dto;
    }
}
