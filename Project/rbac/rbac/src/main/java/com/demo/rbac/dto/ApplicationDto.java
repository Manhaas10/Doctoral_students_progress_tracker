package com.demo.rbac.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
public class ApplicationDto {

    private Long examId;
    private String name;
    private String studentEmail;
    private List<String> specializedSyllabi;
    private String status;
    private String shift;
    private String guideComment;
    private Long guideId;
    private String studentRoll;
    private String studentName;
    private LocalDateTime dateApplied;

}
