package com.demo.rbac.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "committee_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CommitteeMember {

    @Id  // Corrected import
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Primary key

    private String name;
    private String email;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {  // Add setter for JPA
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
