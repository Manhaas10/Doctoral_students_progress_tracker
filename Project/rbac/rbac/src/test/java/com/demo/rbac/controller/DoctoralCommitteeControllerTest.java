package com.demo.rbac.controller;

import com.demo.rbac.model.CommitteeMember;
import com.demo.rbac.model.DoctoralCommittee;
import com.demo.rbac.repository.DoctoralCommitteeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctoralCommitteeController.class)
public class DoctoralCommitteeControllerTest {
    private static final String STUDENT_ID = "B220780CS";
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Mock
    private DoctoralCommitteeRepository repository;
    @Autowired
    private MockMvc mockMvc;


    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetDoctoralCommittee_Found() throws Exception {
        DoctoralCommittee dc = new DoctoralCommittee();
        dc.setStudentId(STUDENT_ID);

        Mockito.when(repository.findByStudentId(STUDENT_ID)).thenReturn(dc);

        mockMvc.perform(get("/api/students/" + STUDENT_ID + "/dc/get-dc"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetDoctoralCommittee_NotFound() throws Exception {
        Mockito.when(repository.findByStudentId(STUDENT_ID)).thenReturn(null);

        mockMvc.perform(get("/api/students/" + STUDENT_ID + "/dc/get-dc"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("not found")));
    }

    @Test
    void testCreateDoctoralCommittee_Success() throws Exception {
        DoctoralCommittee newDC = new DoctoralCommittee();
        newDC.setPhdSupervisorName("Prof. A");
        newDC.setPhdSupervisorEmail("a@nitc.ac.in");
        newDC.setDcChairName("Prof. B");
        newDC.setDcChairEmail("b@nitc.ac.in");

        CommitteeMember member = new CommitteeMember();
        member.setName("Member 1");
        member.setEmail("m1@nitc.ac.in");

        newDC.setMembers(List.of(member));

        Mockito.when(repository.findByStudentId(STUDENT_ID)).thenReturn(null);
        Mockito.when(repository.save(any())).thenReturn(newDC);

        mockMvc.perform(post("/api/students/" + STUDENT_ID + "/dc/create-dc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newDC)))
                .andExpect(status().isCreated());
    }

    @Test
    void testCreateDoctoralCommittee_AlreadyExists() throws Exception {
        Mockito.when(repository.findByStudentId(STUDENT_ID)).thenReturn(new DoctoralCommittee());

        mockMvc.perform(post("/api/students/" + STUDENT_ID + "/dc/create-dc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("already exists")));
    }

    @Test
    void testCreateDoctoralCommittee_EdgeCase_NoMembers() throws Exception {
        DoctoralCommittee dc = new DoctoralCommittee();
        dc.setPhdSupervisorName("Prof. A");
        dc.setPhdSupervisorEmail("a@nitc.ac.in");
        dc.setDcChairName("Prof. B");
        dc.setDcChairEmail("b@nitc.ac.in");
        dc.setMembers(List.of());  // Empty list

        Mockito.when(repository.findByStudentId(STUDENT_ID)).thenReturn(null);

        mockMvc.perform(post("/api/students/" + STUDENT_ID + "/dc/create-dc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dc)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("at least one DC member")));
    }

    @Test
    void testUpdateDoctoralCommittee_Success() throws Exception {
        DoctoralCommittee current = new DoctoralCommittee();
        current.setStudentId(STUDENT_ID);
        current.setDcChairChanged(false);
        current.setPhdSupervisorChanged(false);
        current.setMembers(List.of(new CommitteeMember()));

        DoctoralCommittee updated = new DoctoralCommittee();
        updated.setPhdSupervisorName("Prof. X");
        updated.setPhdSupervisorEmail("x@nitc.ac.in");
        updated.setDcChairName("Prof. Y");
        updated.setDcChairEmail("y@nitc.ac.in");

        CommitteeMember updatedMember = new CommitteeMember();
        updatedMember.setName("Updated Member");
        updatedMember.setEmail("updated@nitc.ac.in");
        updated.setMembers(List.of(updatedMember));

        Mockito.when(repository.findByStudentId(STUDENT_ID)).thenReturn(current);
        Mockito.when(repository.save(any())).thenReturn(current);

        mockMvc.perform(put("/api/students/" + STUDENT_ID + "/dc/put-dc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateDoctoralCommittee_ChairChangedTwice() throws Exception {
        DoctoralCommittee existing = new DoctoralCommittee();
        existing.setStudentId(STUDENT_ID);
        existing.setDcChairChanged(true);  // Already changed once

        DoctoralCommittee updated = new DoctoralCommittee();
        updated.setDcChairName("New Chair");
        updated.setDcChairEmail("newchair@nitc.ac.in");

        CommitteeMember member = new CommitteeMember();
        member.setName("M1");
        member.setEmail("m1@nitc.ac.in");
        updated.setMembers(List.of(member));

        Mockito.when(repository.findByStudentId(STUDENT_ID)).thenReturn(existing);

        mockMvc.perform(put("/api/students/" + STUDENT_ID + "/dc/put-dc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("DC Chair can only be changed once")));
    }

    @Test
    void testUpdateDoctoralCommittee_NoMembers() throws Exception {
        DoctoralCommittee existing = new DoctoralCommittee();
        existing.setStudentId(STUDENT_ID);

        DoctoralCommittee updated = new DoctoralCommittee();
        updated.setMembers(List.of());  // No members

        Mockito.when(repository.findByStudentId(STUDENT_ID)).thenReturn(existing);

        mockMvc.perform(put("/api/students/" + STUDENT_ID + "/dc/put-dc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("at least one DC member")));
    }
}
