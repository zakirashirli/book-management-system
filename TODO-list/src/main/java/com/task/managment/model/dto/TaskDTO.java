package com.task.managment.model.dto;

import com.task.managment.model.enums.Priority;
import com.task.managment.model.enums.TaskStatus;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO implements Serializable {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private TaskStatus status;
    private Priority priority;
}
