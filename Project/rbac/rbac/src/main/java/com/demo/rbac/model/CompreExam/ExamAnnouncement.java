package com.demo.rbac.model.CompreExam;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
public class ExamAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDate examDate;
    private LocalDate deadline;
    private String examVenue;
    private String examDuration;
    private String examShift;
    private boolean broadcast;  // must be true to announce

    @OneToMany(mappedBy = "examAnnouncement")
    @JsonManagedReference
    private List<Comment> comments;
}
