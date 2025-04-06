package com.demo.rbac.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentGuideDTO {
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String studentAdmissionScheme;  // New field
    private String studentOrcid;            // New field (optional, will be updated later)
    private String studentAreaofresearch;   // New field (optional, will be updated later)
    private String studentDateofjoin;
    private String guideName;
    private String guideEmail;
    
}
