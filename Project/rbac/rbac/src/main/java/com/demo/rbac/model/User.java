package com.demo.rbac.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Enumerated(EnumType.STRING)
    private UserRole userRole;

    public UserRole getUserRole() {
        System.out.println("we are entering here ig getUserRole");
        System.out.println("getUserRole " + "User " + userRole);
        return userRole;
    }
}
