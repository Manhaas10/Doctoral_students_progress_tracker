package com.demo.rbac.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class PublicationhRequest {
    private String rollNo;
    private String title;
    private String journal;
    private String doi;
    private String publicationType;
    private String quartile;
    private String status;
    private String publishername; // ✅ Fixed field naming to match Entity
    private String indexing;
    private LocalDate dateOfSubmission;
}
