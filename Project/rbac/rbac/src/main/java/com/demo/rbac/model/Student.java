package com.demo.rbac.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Student extends User{
    @Id
    private String roll; // Example: P202300CS
    private String name;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id") // Foreign key column in the "students" table
    @JsonIgnore
    private Guide guide;
    private String email;

    @Enumerated(EnumType.STRING)
    private UserRole userRole = UserRole.STUDENT;
    // @Enumerated(EnumType.STRING)
    private String admissionscheme; // New column
    // @Enumerated(EnumType.STRING)
    // private AdmissionScheme admissionScheme; // New column
    private String areaofresearch;
    private String dateofjoin;
    private String orcid; // New ORCID field

}
