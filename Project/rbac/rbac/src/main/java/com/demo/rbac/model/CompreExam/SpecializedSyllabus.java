package com.demo.rbac.model.CompreExam;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
public class SpecializedSyllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The actual text content of the specialized syllabus
    @Lob
    private String content;

    @ManyToOne
    @JoinColumn(name = "application_id")
    @JsonBackReference
    private Application application;

}

