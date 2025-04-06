package com.demo.rbac.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "coursereq")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId; // FK to students table
    private String courseId;  // FK to courses table
    private String courseName;
    private String provider;  // Course provider (e.g., NPTEL, Coursera)
    private String startDate;
    private String endDate;
    private String Duration;
    private String status; // "Applied", "Approved"
    // @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    // private LocalDateTime appliedAt;
}
