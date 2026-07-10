package com.task.managment.repo;

import com.task.managment.model.entity.Task;
import com.task.managment.model.enums.Priority;
import com.task.managment.model.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);
    List<Task> findByPriority(Priority priority);
    List<Task> findByTitleContainingIgnoreCase(String title);

}
