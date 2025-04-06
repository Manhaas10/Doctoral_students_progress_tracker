package com.demo.rbac.model.CompreExam;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;

import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Associate with the exam announcement
    @ManyToOne
    @JoinColumn(name = "exam_announcement_id", nullable = false)
    @JsonBackReference
    private ExamAnnouncement examAnnouncement;

    private String studentEmail;
    private String comment;

    private LocalDateTime timestamp = LocalDateTime.now();
}

