package com.demo.rbac.controller;

import com.demo.rbac.model.Guide;
import com.demo.rbac.model.Student;
import com.demo.rbac.service.student.StudentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserProfileController.class)
class UserProfileControllerTest {

    @Autowired
    @Mock
    private StudentService studentService;

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }


    @Test
    void testGetProfile_Success() throws Exception {
        // Given
        Student student = new Student();
        student.setEmail("b123456789@nitc.ac.in");
        student.setOrcid("1234-5678-9012");
        student.setAreaofresearch("AI");

        Guide guide = new Guide();
        guide.setName("Dr. X");
        guide.setEmail("x@nitc.ac.in");
        student.setGuide(guide);

        when(studentService.findByEmail("b123456789@nitc.ac.in")).thenReturn(Optional.of(student));

        mockMvc.perform(get("/api/user/profile")
                        .principal(() -> "b123456789@nitc.ac.in")
                        .requestAttr("name", "Student A"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").exists())
               .andExpect(jsonPath("$.email").value("b123456789@nitc.ac.in"))
               .andExpect(jsonPath("$.rollNumber").value("B123456789"))
               .andExpect(jsonPath("$.orcid").value("1234-5678-9012"))
               .andExpect(jsonPath("$.areaofresearch").value("AI"))
               .andExpect(jsonPath("$.guideName").value("Dr. X"))
               .andExpect(jsonPath("$.guideEmail").value("x@nitc.ac.in"));
    }

    @Test
    void testGetProfile_StudentNotFound() throws Exception {
        when(studentService.findByEmail("b123456789@nitc.ac.in")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/user/profile")
                        .principal(() -> "b123456789@nitc.ac.in")
                        .requestAttr("name", "Student A"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.orcid").value(""))
               .andExpect(jsonPath("$.areaofresearch").value(""))
               .andExpect(jsonPath("$.guideName").value(""))
               .andExpect(jsonPath("$.guideEmail").value(""));
    }

    @Test
    void testUpdateProfile_Success() throws Exception {
        Student updated = new Student();
        updated.setEmail("b123456789@nitc.ac.in");
        updated.setOrcid("updated-orcid");
        updated.setAreaofresearch("ML");

        when(studentService.findByEmail("b123456789@nitc.ac.in")).thenReturn(Optional.of(new Student()));

        mockMvc.perform(put("/api/user/update-profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "b123456789@nitc.ac.in",
                                    "orcid": "updated-orcid",
                                    "areaofresearch": "ML"
                                }
                                """))
               .andExpect(status().isOk())
               .andExpect(content().string("Profile updated successfully."));
    }

    @Test
    void testUpdateProfile_NotFound() throws Exception {
        when(studentService.findByEmail("b123456789@nitc.ac.in")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/user/update-profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "b123456789@nitc.ac.in",
                                    "orcid": "updated-orcid",
                                    "areaofresearch": "ML"
                                }
                                """))
               .andExpect(status().isNotFound())
               .andExpect(content().string("Student not found."));
    }
}
