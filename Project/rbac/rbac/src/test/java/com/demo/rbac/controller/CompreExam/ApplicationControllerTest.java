package com.demo.rbac.controller.CompreExam;

import com.demo.rbac.dto.ApplicationDto;
import com.demo.rbac.model.CompreExam.Application;
import com.demo.rbac.model.CompreExam.SpecializedSyllabus;
import com.demo.rbac.model.Guide;
import com.demo.rbac.model.Student;
import com.demo.rbac.repository.CompreExam.ApplicationRepository;
import com.demo.rbac.repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApplicationController.class)
public class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private StudentRepository studentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Student student;
    private Guide guide;
    private Application application;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        guide = new Guide();
        guide.setId(1L);

        student = new Student();
        student.setEmail("student@example.com");
        student.setRoll("M21CS001");
        student.setName("John Doe");
        student.setGuide(guide);

        application = new Application();
        application.setId(1L);
        application.setExamId(101L);
        application.setName("Comprehensive Exam");
        application.setStudentEmail(student.getEmail());
        application.setStatus("Submitted");
        application.setStudentRoll(student.getRoll());
        application.setStudentName(student.getName());
        application.setGuideId(guide.getId());
        application.setDateApplied(LocalDateTime.now());

        // Add specialized syllabi to application
        SpecializedSyllabus s1 = new SpecializedSyllabus();
        s1.setContent("Syllabus A");
        s1.setApplication(application);

        SpecializedSyllabus s2 = new SpecializedSyllabus();
        s2.setContent("Syllabus B");
        s2.setApplication(application);

        application.setSpecializedSyllabi(List.of(s1, s2));
    }

    @Test
    void testCreateApplication() throws Exception {
        ApplicationDto dto = new ApplicationDto();
        dto.setExamId(101L);
        dto.setStudentEmail(student.getEmail());
        dto.setName("Comprehensive Exam");
        dto.setStatus("Submitted");
        dto.setGuideComment("Initial");
        dto.setShift("FN");
        dto.setSpecializedSyllabi(List.of("Syllabus A", "Syllabus B"));

        when(studentRepository.findByEmail(anyString())).thenReturn(Optional.of(student));
        when(applicationRepository.save(any(Application.class))).thenReturn(application);

        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentEmail").value("student@example.com"))
                .andExpect(jsonPath("$.specializedSyllabi[0].content").value("Syllabus A"))
                .andExpect(jsonPath("$.specializedSyllabi[1].content").value("Syllabus B"));
    }

    @Test
    void testCreateApplication_MissingExamIdOrEmail() throws Exception {
        ApplicationDto dto = new ApplicationDto();
        dto.setName("Comprehensive Exam");

        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testCreateApplication_StudentNotFound() throws Exception {
        ApplicationDto dto = new ApplicationDto();
        dto.setExamId(101L);
        dto.setStudentEmail("missing@student.com");

        when(studentRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testGetApplicationsForGuide() throws Exception {
        when(applicationRepository.findByGuideId(1L)).thenReturn(List.of(application));

        mockMvc.perform(get("/api/applications/guide/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentRoll").value("M21CS001"));
    }

    @Test
    void testGetApplicationsForStudent() throws Exception {
        when(applicationRepository.findByStudentEmail("student@example.com")).thenReturn(List.of(application));

        mockMvc.perform(get("/api/applications/student/student@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentName").value("John Doe"));
    }

    @Test
    void testGetApplicationsForStudent_NoApps() throws Exception {
        when(applicationRepository.findByStudentEmail("student@example.com")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/applications/student/student@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void testGetApplicationsForGuide_NoApps() throws Exception {
        when(applicationRepository.findByGuideId(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/applications/guide/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void testUpdateApplication() throws Exception {
        ApplicationDto dto = new ApplicationDto();
        dto.setStatus("Approved");
        dto.setGuideComment("Looks good");
        dto.setSpecializedSyllabi(List.of("Updated Syllabus"));

        // Add updated syllabus for return
        SpecializedSyllabus updated = new SpecializedSyllabus();
        updated.setContent("Updated Syllabus");
        updated.setApplication(application);

        application.setStatus("Approved");
        application.setGuideComment("Looks good");
        application.setSpecializedSyllabi(List.of(updated));

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenReturn(application);

        mockMvc.perform(put("/api/applications/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Approved"))
                .andExpect(jsonPath("$.specializedSyllabi[0].content").value("Updated Syllabus"));
    }

    @Test
    void testUpdateApplication_NotFound() throws Exception {
        ApplicationDto dto = new ApplicationDto();
        dto.setStatus("Rejected");

        when(applicationRepository.findById(anyLong())).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/applications/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testUpdateApplication_EmptySyllabi() throws Exception {
        ApplicationDto dto = new ApplicationDto();
        dto.setSpecializedSyllabi(new ArrayList<>());

        application.setSpecializedSyllabi(new ArrayList<>());

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenReturn(application);

        mockMvc.perform(put("/api/applications/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.specializedSyllabi").isEmpty());
    }

    @Test
    void testGetAllApplications() throws Exception {
        when(applicationRepository.findAll()).thenReturn(List.of(application));

        mockMvc.perform(get("/api/applications/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value("student@example.com"))
                .andExpect(jsonPath("$[0].specializedSyllabi[0].content").value("Syllabus A"));
    }
}
