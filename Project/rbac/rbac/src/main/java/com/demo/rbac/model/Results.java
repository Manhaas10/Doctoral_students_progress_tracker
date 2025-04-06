package com.demo.rbac.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "results")
public class Results {

    @Id
    private String id; // Example: P202300CS
    private String Name;
    private Integer Core;
    private Integer Specialization;


}
