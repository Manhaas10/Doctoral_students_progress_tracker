package com.demo.rbac.controller.publications;

import com.demo.rbac.dto.PublicationRequest;
import com.demo.rbac.model.Publication;
import com.demo.rbac.service.publications.PublicationService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PublicationController.class)
class PublicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Autowired
    @Mock
    private PublicationService publicationService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAddPublication_Success() throws Exception {
        PublicationRequest request = new PublicationRequest();
        request.setRollNo("B123456789");
        request.setTitle("AI Research");
        request.setStatus("Pending");

        Publication publication = new Publication();
        publication.setId(1L);
        publication.setRollNo("B123456789");
        publication.setTitle("AI Research");
        publication.setStatus("Pending");

        when(publicationService.savePublication(any(PublicationRequest.class))).thenReturn(publication);

        mockMvc.perform(post("/api/publications/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.rollNo").value("B123456789"))
                .andExpect(jsonPath("$.title").value("AI Research"))
                .andExpect(jsonPath("$.status").value("Pending"));
    }

    @Test
    void testAddPublication_Failure() throws Exception {
        PublicationRequest request = new PublicationRequest();
        request.setRollNo("B123456789");
        request.setTitle("Test Pub");
        request.setStatus("Pending");

        when(publicationService.savePublication(any(PublicationRequest.class)))
                .thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(post("/api/publications/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Failed to save publication"));
    }

    @Test
    void testUpdatePublicationStatus_Success() throws Exception {
        Publication existing = new Publication();
        existing.setId(1L);
        existing.setStatus("Pending");
        existing.setRollNo("B123456789");

        Publication updated = new Publication();
        updated.setId(1L);
        updated.setStatus("Approved");
        updated.setRollNo("B123456789");

        when(publicationService.getPublicationById(1L)).thenReturn(Optional.of(existing));
        when(publicationService.savePublication(any(Publication.class))).thenReturn(updated);

        mockMvc.perform(put("/api/publications/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "status": "Approved"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Approved"));
    }

    @Test
    void testUpdatePublicationStatus_NotFound() throws Exception {
        when(publicationService.getPublicationById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/publications/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "status": "Approved"
                            }
                        """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Publication not found"));
    }

    @Test
    void testGetPublicationsByRollNo_Found() throws Exception {
        Publication p1 = new Publication();
        p1.setId(1L);
        p1.setTitle("Research 1");
        p1.setRollNo("B123456789");

        Publication p2 = new Publication();
        p2.setId(2L);
        p2.setTitle("Research 2");
        p2.setRollNo("B123456789");

        List<Publication> list = List.of(p1, p2);
        when(publicationService.getPublicationsByRollNo("B123456789")).thenReturn(list);

        mockMvc.perform(get("/api/publications/get/B123456789"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Research 1"))
                .andExpect(jsonPath("$[1].title").value("Research 2"));
    }

    @Test
    void testGetPublicationsByRollNo_NotFound() throws Exception {
        when(publicationService.getPublicationsByRollNo("B123456789")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/publications/get/B123456789"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No publications found for this roll number"));
    }
}
