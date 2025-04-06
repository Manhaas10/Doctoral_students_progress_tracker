package com.demo.rbac.controller;

import com.demo.rbac.dto.StudentGuideDTO;
import com.demo.rbac.model.Student;
import com.demo.rbac.service.student.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class StudentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StudentService studentService;

    @InjectMocks
    private StudentController studentController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(studentController).build();
    }

    @Test
    void testUploadFile_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "students.xlsx",
                "application/vnd.ms-excel", new byte[10]);

        List<Student> students = List.of(new Student());
        when(studentService.saveStudentsFromExcel(any())).thenReturn(students);

        mockMvc.perform(multipart("/api/students/upload").file(file))
                .andExpect(status().isOk());
    }

    @Test
    void testUploadFile_Failure() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "students.xlsx",
                "application/vnd.ms-excel", new byte[10]);

        when(studentService.saveStudentsFromExcel(any())).thenThrow(new RuntimeException("Failed to parse"));

        mockMvc.perform(multipart("/api/students/upload").file(file))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUploadFile_NullFile() throws Exception {
        mockMvc.perform(multipart("/api/students/upload"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetPublicationCount() throws Exception {
        when(studentService.getPublicationCountForStudent("CS123")).thenReturn(5);

        mockMvc.perform(get("/api/students/CS123/publications"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @Test
    void testGetPublicationCount_StudentNotFound() throws Exception {
        when(studentService.getPublicationCountForStudent("CS404"))
                .thenThrow(new RuntimeException("Student not found"));

        mockMvc.perform(get("/api/students/CS404/publications"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testGetAllStudents() throws Exception {
        List<StudentGuideDTO> studentList = List.of(new StudentGuideDTO());
        when(studentService.getAllStudentsWithGuides()).thenReturn(studentList);

        mockMvc.perform(get("/api/students/all"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetAllStudents_EmptyList() throws Exception {
        when(studentService.getAllStudentsWithGuides()).thenReturn(List.of());

        mockMvc.perform(get("/api/students/all"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void testGetCurrentStudent_Success() throws Exception {
        Student student = new Student();
        when(studentService.findByEmail("test@email.com")).thenReturn(Optional.of(student));

        mockMvc.perform(get("/api/students/me").principal(() -> "test@email.com"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetCurrentStudent_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/students/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetCurrentStudent_NotFound() throws Exception {
        when(studentService.findByEmail("test@email.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/students/me").principal(() -> "test@email.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetStudentByRollNumber_Found() throws Exception {
        Student student = new Student();
        when(studentService.getStudentByRollNumber("CS123")).thenReturn(Optional.of(student));

        mockMvc.perform(get("/api/students/CS123"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetStudentByRollNumber_NotFound() throws Exception {
        when(studentService.getStudentByRollNumber("CS123")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/students/CS123"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateStudent_Success() throws Exception {
        Student updated = new Student();
        updated.setOrcid("orcid-123");
        updated.setAreaofresearch("AI");

        Student existing = new Student();
        when(studentService.getStudentByRollNumber("CS123")).thenReturn(Optional.of(existing));
        when(studentService.updateStudent(any())).thenReturn(updated);

        mockMvc.perform(put("/api/students/CS123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                 {
                                   "orcid": "orcid-123",
                                   "areaofresearch": "AI"
                                 }
                                 """))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateStudent_NotFound() throws Exception {
        when(studentService.getStudentByRollNumber("CS123")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/students/CS123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateStudent_InvalidJson() throws Exception {
        mockMvc.perform(put("/api/students/CS123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("invalid json"))
                .andExpect(status().isBadRequest());
    }
}
