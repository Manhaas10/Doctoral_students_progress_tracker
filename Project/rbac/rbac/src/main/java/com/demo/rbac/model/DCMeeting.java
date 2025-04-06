package com.demo.rbac.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "dc_meetings")
@Getter
@Setter
@RequiredArgsConstructor
public class DCMeeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentEmail;  // To identify which student this record belongs to

    private LocalDate date;

    private LocalTime time;

    @Lob
    private String writeup;

    private String fileName;
    private String status;

    @Lob
    private byte[] fileData;

    private String comments;
}
