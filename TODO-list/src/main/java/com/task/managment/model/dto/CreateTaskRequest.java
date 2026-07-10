package com.task.managment.model.dto;

import com.task.managment.model.enums.Priority;
import com.task.managment.model.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTaskRequest {

    @NotBlank(message = "Title cannot be empty")
    @Size(min = 3, max = 100, message = "3-100!")
    private String title;

    @Size(min = 3, max = 300, message = "3-300!")
    private String description;

    private TaskStatus status;
    private Priority priority;
}
