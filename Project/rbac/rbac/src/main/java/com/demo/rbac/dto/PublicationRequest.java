package com.demo.rbac.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class PublicationRequest {
    private String rollNo;
    private String title;
    private String journal;
    private String doi;
    private String publicationType;
    private String quartile;
    private String status;
    // private String title;
    private String publishername;
    // private String journal;
    // private String doi;
    // private String publicationType;
    // private String status;
    private String indexing;
    // private String quartile;
    // private boolean sendCopyToCoordinator;
     private LocalDate dateOfSubmission; 
}

