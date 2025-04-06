package com.demo.rbac.controller;

import com.demo.rbac.model.DCMeeting;
import com.demo.rbac.model.Guide;
import com.demo.rbac.model.Student;
import com.demo.rbac.repository.DCMeetingRepository;
import com.demo.rbac.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DCMeetingController.class)
public class DCMeetingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private DCMeetingRepository dcMeetingRepository;

    @Mock
    private StudentRepository studentRepository;

    private Principal mockPrincipal;

    @BeforeEach
    void setup() {
        mockPrincipal = () -> "student@example.com";
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @WithMockUser
    public void testCreateMeeting() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "report.pdf", "application/pdf", "Sample PDF content".getBytes());

        mockMvc.perform(multipart("/api/dc-meetings/create")
                        .file(file)
                        .param("date", "2024-04-01")
                        .param("time", "10:30:00")
                        .param("writeup", "Discussed progress and plans.")
                        .param("status", "submitted")
                        .principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(content().string("Meeting created successfully"));
    }

    @Test
    @WithMockUser
    public void testCreateMeeting_MissingParams() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "report.pdf", "application/pdf", "Sample PDF content".getBytes());

        mockMvc.perform(multipart("/api/dc-meetings/create")
                        .file(file)
                        .param("time", "10:30:00")
                        .principal(mockPrincipal))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testFetchMeetings() throws Exception {
        DCMeeting meeting = new DCMeeting();
        meeting.setId(1L);
        meeting.setStudentEmail("student@example.com");
        meeting.setDate(LocalDate.of(2024, 4, 1));
        meeting.setTime(LocalTime.of(10, 30));
        meeting.setWriteup("Progress reviewed");
        meeting.setStatus("submitted");
        meeting.setFileName("report.pdf");
        meeting.setFileData("Sample content".getBytes());
        meeting.setComments("Reviewed by supervisor");

        Mockito.when(dcMeetingRepository.findByStudentEmail("student@example.com"))
                .thenReturn(List.of(meeting));

        mockMvc.perform(get("/api/dc-meetings/fetch")
                        .principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].writeup").value("Progress reviewed"))
                .andExpect(jsonPath("$[0].status").value("submitted"))
                .andExpect(jsonPath("$[0].fileName").value("report.pdf"))
                .andExpect(jsonPath("$[0].comments").value("Reviewed by supervisor"));
    }

    @Test
    @WithMockUser
    public void testSubmitMeeting() throws Exception {
        DCMeeting meeting = new DCMeeting();
        meeting.setId(1L);
        meeting.setStudentEmail("student@example.com");
        meeting.setStatus("draft");

        Mockito.when(dcMeetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        mockMvc.perform(put("/api/dc-meetings/submit/1").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(content().string("Meeting status updated to Submitted successfully"));
    }

    @Test
    @WithMockUser
    public void testSubmitMeeting_NotFound() throws Exception {
        Mockito.when(dcMeetingRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/dc-meetings/submit/1").principal(mockPrincipal))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testSupervisorUpdateMeetingStatus() throws Exception {
        DCMeeting meeting = new DCMeeting();
        meeting.setId(1L);
        meeting.setStudentEmail("student@example.com");

        Guide guide = new Guide();
        guide.setEmail("supervisor@example.com");

        Student student = new Student();
        student.setEmail("student@example.com");
        student.setGuide(guide);

        Mockito.when(dcMeetingRepository.findById(1L)).thenReturn(Optional.of(meeting));
        Mockito.when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));

        String json = """
                {
                    "status": "approved",
                    "comments": "Looks good"
                }
                """;

        mockMvc.perform(put("/api/dc-meetings/supervisor-action/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .principal(() -> "supervisor@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("Status updated to approved"));
    }

    @Test
    @WithMockUser
    public void testSupervisorUpdateMeetingStatus_NotFound() throws Exception {
        Mockito.when(dcMeetingRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/dc-meetings/supervisor-action/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "status": "approved",
                                "comments": "OK"
                            }
                            """)
                        .principal(() -> "supervisor@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testSupervisorUpdateMeetingStatus_UnauthorizedGuide() throws Exception {
        DCMeeting meeting = new DCMeeting();
        meeting.setId(1L);
        meeting.setStudentEmail("student@example.com");

        Guide guide = new Guide();
        guide.setEmail("other@example.com");

        Student student = new Student();
        student.setEmail("student@example.com");
        student.setGuide(guide);

        Mockito.when(dcMeetingRepository.findById(1L)).thenReturn(Optional.of(meeting));
        Mockito.when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));

        mockMvc.perform(put("/api/dc-meetings/supervisor-action/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "status": "approved",
                                "comments": "OK"
                            }
                            """)
                        .principal(() -> "supervisor@example.com"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    public void testSupervisorUpdateMeetingStatus_StudentNotFound() throws Exception {
        DCMeeting meeting = new DCMeeting();
        meeting.setId(1L);
        meeting.setStudentEmail("student@example.com");

        Mockito.when(dcMeetingRepository.findById(1L)).thenReturn(Optional.of(meeting));
        Mockito.when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/dc-meetings/supervisor-action/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "status": "approved",
                                "comments": "OK"
                            }
                            """)
                        .principal(() -> "supervisor@example.com"))
                .andExpect(status().isNotFound());
    }
}
