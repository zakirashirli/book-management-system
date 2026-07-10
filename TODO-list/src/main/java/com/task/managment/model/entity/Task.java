package com.task.managment.model.entity;

import com.task.managment.model.enums.Priority;
import com.task.managment.model.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;
    @Enumerated(EnumType.STRING)
    private Priority priority;

//    private LocalDateTime createdAt;
//    private LocalDateTime updateAt;
//
//    @PrePersist
//    public void prePersist() {
//        createdAt = LocalDateTime.now();
//
//        if (status == null) {
//            status = TaskStatus.TODO;
//        }
//
//        if (priority == null) {
//            priority = Priority.MEDIUM;
//        }
//    }
//
//    @PreUpdate
//    public void preUpdate() {
//        updateAt = LocalDateTime.now();
//    }

}
