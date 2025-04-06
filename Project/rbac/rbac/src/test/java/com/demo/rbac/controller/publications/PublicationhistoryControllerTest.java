package com.demo.rbac.controller.publications;

import com.demo.rbac.model.Publicationhistory;
import com.demo.rbac.service.publications.PublicationhistoryService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PublicationhistoryController.class)
class PublicationhistoryControllerTest {

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Mock
    private PublicationhistoryService publicationhistoryService;
    @Autowired
    private MockMvc mockMvc;

  

    @Test
    void shouldCreateNewPublicationHistoryEntry_WhenNoPreviousExists() throws Exception {
        when(publicationhistoryService.getLatestHistoryByTitleAndRollNo(anyString(), anyString()))
                .thenReturn(Optional.empty());

        Publicationhistory saved = new Publicationhistory();
        saved.setId(1L);
        saved.setTitle("AI Study");
        saved.setRollNo("B123456789");

        when(publicationhistoryService.saveNewPublicationHistory(any(Publicationhistory.class)))
                .thenReturn(saved);

        mockMvc.perform(post("/api/publications/history/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "title": "AI Study",
                                "publishername": "IEEE",
                                "journal": "IEEE Access",
                                "doi": "10.1109/ACCESS.2024.123456",
                                "publicationType": "Journal",
                                "status": "Submitted",
                                "indexing": "Scopus",
                                "quartile": "Q1",
                                "rollNo": "B123456789",
                                "dateOfSubmission": "2024-04-01"
                            }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("AI Study"));
    }

    @Test
    void shouldReturnOkAndMessage_WhenNoChangesDetectedInHistory() throws Exception {
        Publicationhistory existing = new Publicationhistory();
        existing.setTitle("AI Study");
        existing.setStatus("Submitted");
        existing.setDateOfSubmission(LocalDate.parse("2024-04-01"));

        when(publicationhistoryService.getLatestHistoryByTitleAndRollNo(eq("AI Study"), eq("B123456789")))
                .thenReturn(Optional.of(existing));

        mockMvc.perform(post("/api/publications/history/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "title": "AI Study",
                                "publishername": "IEEE",
                                "journal": "IEEE Access",
                                "doi": "10.1109/ACCESS.2024.123456",
                                "publicationType": "Journal",
                                "status": "Submitted",
                                "indexing": "Scopus",
                                "quartile": "Q1",
                                "rollNo": "B123456789",
                                "dateOfSubmission": "2024-04-01"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("No changes detected, history entry not added."));
    }

    @Test
    void shouldReturnServerError_WhenExceptionOccursDuringAdd() throws Exception {
        when(publicationhistoryService.getLatestHistoryByTitleAndRollNo(anyString(), anyString()))
                .thenThrow(new RuntimeException("DB failure"));

        mockMvc.perform(post("/api/publications/history/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "title": "AI Study",
                                "publishername": "IEEE",
                                "journal": "IEEE Access",
                                "doi": "10.1109/ACCESS.2024.123456",
                                "publicationType": "Journal",
                                "status": "Submitted",
                                "indexing": "Scopus",
                                "quartile": "Q1",
                                "rollNo": "B123456789",
                                "dateOfSubmission": "2024-04-01"
                            }
                        """))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Failed to create publication history entry"));
    }

    @Test
    void shouldReturnPublicationHistoryList_WhenFoundByRollNo() throws Exception {
        Publicationhistory entry = new Publicationhistory();
        entry.setId(1L);
        entry.setTitle("AI Research");
        entry.setRollNo("B123456789");

        List<Publicationhistory> list = List.of(entry);
        when(publicationhistoryService.getHistoryByRollNo("B123456789")).thenReturn(list);

        mockMvc.perform(get("/api/publications/history/student/B123456789"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("AI Research"));
    }

    @Test
    void shouldReturnNotFound_WhenNoHistoryForRollNo() throws Exception {
        when(publicationhistoryService.getHistoryByRollNo("B123456789")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/publications/history/student/B123456789"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No publication history found for this roll number"));
    }
}
