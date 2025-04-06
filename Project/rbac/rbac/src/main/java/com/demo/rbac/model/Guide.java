package com.demo.rbac.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "guides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Guide extends User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    @Enumerated(EnumType.STRING)
    private UserRole userRole = UserRole.SUPERVISOR;

    public Guide(String name, String email) {
        this.name = name;
        this.email = email;
    }

    @OneToMany(mappedBy = "guide", cascade = CascadeType.ALL, fetch = FetchType.LAZY) // One guide has multiple students
    @JsonManagedReference
    private List<Student> students;

    public UserRole getUserRole(){
        System.out.println("getUserRole "+ "guide "+ userRole);
        return this.userRole;
    }
}
