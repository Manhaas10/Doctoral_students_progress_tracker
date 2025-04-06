package com.demo.rbac.controller;

import com.demo.rbac.dto.GuideDTO;
import com.demo.rbac.dto.StudentUnderGuideDTO;
import com.demo.rbac.service.GuideService;
import com.demo.rbac.service.student.StudentService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GuideController.class)
class GuideControllerTest {

    private static final String EMAIL = "guide@example.com";
    private static final String UNKNOWN_EMAIL = "notfound@example.com";
    private static final Long GUIDE_ID = 10L;

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private GuideService guideService;

    @Mock
    private StudentService studentService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetStudentsUnderGuide() throws Exception {
        List<StudentUnderGuideDTO> students = List.of(new StudentUnderGuideDTO("CS123", "Alice", "orcid-001", 2));
        when(studentService.getStudentsUnderGuide(1L)).thenReturn(students);

        mockMvc.perform(get("/api/guides/1/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roll").value("CS123"))
                .andExpect(jsonPath("$[0].name").value("Alice"))
                .andExpect(jsonPath("$[0].orcid").value("orcid-001"))
                .andExpect(jsonPath("$[0].publicationCount").value(2));
    }

    @Test
    void testGetStudentsUnderGuide_Empty() throws Exception {
        when(studentService.getStudentsUnderGuide(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/guides/1/students"))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test
    void testGetGuideById_Found() throws Exception {
        GuideDTO guide = new GuideDTO(1L, "Dr. John", "john@example.com");
        when(guideService.getGuideById(1L)).thenReturn(guide);

        mockMvc.perform(get("/api/guides/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Dr. John"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void testGetGuideById_NotFound() throws Exception {
        when(guideService.getGuideById(1L)).thenReturn(null);

        mockMvc.perform(get("/api/guides/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetGuideIdByEmail_Found() throws Exception {
        when(guideService.getGuideIdByEmail("john@example.com")).thenReturn(1L);

        mockMvc.perform(get("/api/guides/email/john@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("1"));
    }

    @Test
    void testGetGuideIdByEmail_NotFound() throws Exception {
        when(guideService.getGuideIdByEmail("unknown@example.com")).thenReturn(null);

        mockMvc.perform(get("/api/guides/email/unknown@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testGetMyId_Found() throws Exception {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("email", EMAIL);
        OAuth2User principal = new DefaultOAuth2User(Collections.emptyList(), attributes, "email");

        when(guideService.getGuideIdByEmail(EMAIL)).thenReturn(GUIDE_ID);

        mockMvc.perform(get("/api/guides/me")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.TestingAuthenticationToken(principal, null)))
                )
                .andExpect(status().isOk())
                .andExpect(content().string(String.valueOf(GUIDE_ID)));
    }

    @Test
    @WithMockUser
    void testGetMyId_NotFound() throws Exception {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("email", UNKNOWN_EMAIL);
        OAuth2User principal = new DefaultOAuth2User(Collections.emptyList(), attributes, "email");

        when(guideService.getGuideIdByEmail(UNKNOWN_EMAIL)).thenReturn(null);

        mockMvc.perform(get("/api/guides/me")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.TestingAuthenticationToken(principal, null)))
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetMyId_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/guides/me"))
                .andExpect(status().isUnauthorized()); // or isForbidden(), depending on config
    }
}
