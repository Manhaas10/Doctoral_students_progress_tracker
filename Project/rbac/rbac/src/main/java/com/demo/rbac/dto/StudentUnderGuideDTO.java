package com.demo.rbac.dto;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentUnderGuideDTO {
    private String rollNo;
    private String name;
    private String orcid;
    private int publicationCount;

    // public StudentUnderGuideDTO(String rollNo, String name, String orcid, int publicationCount) {
    //     this.rollNo = rollNo;
    //     this.name = name;
    //     this.orcid = orcid;
    //     this.publicationCount = publicationCount;
    // }

    // Getters & Setters
}
