package com.demo.rbac.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentPublicationDTO {
    private String roll;
    private String name;
    private String orcid;
    private int publications;
}
