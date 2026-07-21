package com.task.managment.service.interfaces;

import com.task.managment.model.dto.CreateTaskRequest;
import com.task.managment.model.dto.TaskDTO;
import com.task.managment.model.dto.UpdateTaskRequest;
import com.task.managment.model.enums.Priority;
import com.task.managment.model.enums.TaskStatus;

import java.util.List;

public interface TaskService {
    TaskDTO create(CreateTaskRequest request);
    TaskDTO update(Long id, UpdateTaskRequest request);
    TaskDTO getById(Long id);
    TaskDTO start(Long id);
    TaskDTO complete(Long id);
    TaskDTO cancel(Long id);
    List<TaskDTO> getAll();
    List<TaskDTO> getByStatus(TaskStatus status);
    List<TaskDTO> getByPriority(Priority priority);
    List<TaskDTO> searchByTitle(String title);
    void delete(Long id);
}
