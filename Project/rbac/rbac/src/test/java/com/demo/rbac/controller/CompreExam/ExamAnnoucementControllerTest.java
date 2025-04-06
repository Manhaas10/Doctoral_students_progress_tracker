package com.demo.rbac.controller.CompreExam;

import com.demo.rbac.model.CompreExam.ExamAnnouncement;
import com.demo.rbac.service.CompreExam.ExamAnnouncementService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;

import org.springframework.boot.test.mock.mockito.MockBean;

import org.springframework.http.MediaType;

import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExamAnnoucementController.class)
public class ExamAnnoucementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private ExamAnnouncementService examService;

    @Autowired
    private ObjectMapper objectMapper;

    private ExamAnnouncement sampleExam;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        sampleExam = new ExamAnnouncement();
        sampleExam.setId(1L);
        sampleExam.setName("Comprehensive Exam");
        sampleExam.setExamDate(LocalDate.now().plusDays(7));
        sampleExam.setDeadline(LocalDate.now().plusDays(3));
        sampleExam.setExamVenue("Auditorium Hall");
        sampleExam.setExamDuration("2 hours");
        sampleExam.setExamShift("Morning");
        sampleExam.setBroadcast(true);
    }

    // ✅ Test: Announce exam successfully
    @Test
    void testAnnounceExamSuccess() throws Exception {
        Mockito.when(examService.saveExamAnnouncement(any())).thenReturn(sampleExam);

        mockMvc.perform(post("/api/exams/announce")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleExam)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Comprehensive Exam"))
                .andExpect(jsonPath("$.broadcast").value(true));
    }

    // ❌ Negative: broadcast = false
    @Test
    void testAnnounceExamFailsIfNotBroadcast() throws Exception {
        sampleExam.setBroadcast(false);

        mockMvc.perform(post("/api/exams/announce")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleExam)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Exam announcement must be broadcasted."));
    }

    // ✅ Test: Get all exams
    @Test
    void testGetAllExams() throws Exception {
        Mockito.when(examService.getAllExamAnnouncements()).thenReturn(List.of(sampleExam));

        mockMvc.perform(get("/api/exams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Comprehensive Exam"));
    }

    // ✅ Edge case: No announcements
    @Test
    void testGetAllExamsEmpty() throws Exception {
        Mockito.when(examService.getAllExamAnnouncements()).thenReturn(List.of());

        mockMvc.perform(get("/api/exams"))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    // ✅ Test: Update exam successfully
    @Test
    void testUpdateExamSuccess() throws Exception {
        sampleExam.setName("Updated Exam");
        Mockito.when(examService.updateExamAnnouncement(eq(1L), any())).thenReturn(sampleExam);

        mockMvc.perform(put("/api/exams/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleExam)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Exam"));
    }

    // ❌ Negative: Exam not found on update
    @Test
    void testUpdateExamNotFound() throws Exception {
        Mockito.when(examService.updateExamAnnouncement(eq(99L), any()))
                .thenThrow(new RuntimeException("Exam not found"));

        mockMvc.perform(put("/api/exams/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleExam)))
                .andExpect(status().isInternalServerError())  // Optional: replace with proper handler
                .andExpect(content().string("Exam not found"));
    }
}
