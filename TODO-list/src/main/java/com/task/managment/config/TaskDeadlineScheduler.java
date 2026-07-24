package com.task.managment.config;

import com.task.managment.model.entity.Task;
import com.task.managment.model.enums.TaskStatus;
import com.task.managment.repo.TaskRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TaskDeadlineScheduler {
    private final TaskRepo repo;

//    @Scheduled(cron = "0 0 9 * * *")  каждый день в 09:00
    @Scheduled(fixedRate = 10000)
    public void markOverdueTasks() {

        List<TaskStatus> activeStatus = List.of(
                TaskStatus.TODO,
                TaskStatus.IN_PROGRESS
        );

        List<Task> overdueTasks =
                repo.findByDeadlineBeforeAndStatusIn(
                        LocalDateTime.now(),
                        activeStatus
                );

        overdueTasks.forEach(task -> task.setStatus(TaskStatus.OVERDUE));

        repo.saveAll(overdueTasks);

        System.out.println(
                "Overdue tasks updated: " + overdueTasks.size()
        );
    }
}
