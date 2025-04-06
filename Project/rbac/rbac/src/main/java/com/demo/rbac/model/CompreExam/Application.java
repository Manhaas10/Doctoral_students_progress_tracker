package com.demo.rbac.model.CompreExam;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    private Long examId;           // which exam the student is applying for
    private String studentEmail;  // e.g., "P220545CS"
    private LocalDateTime dateApplied;

    private String status;

    private String shift;

    // ONE Application -> MANY Syllabi
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SpecializedSyllabus> specializedSyllabi = new ArrayList<>();

    // In Application.java
    private String guideComment;

    private Long guideId;

    private String studentRoll;
    private String studentName;
}
