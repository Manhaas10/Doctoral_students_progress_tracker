package com.demo.rbac.controller;

import com.demo.rbac.model.CourseRequest;
import com.demo.rbac.repository.CourseRequestRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class CourseRequestControllerTest {

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Mock
    private CourseRequestRepository courseRequestRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private CourseRequest buildRequest(String studentId, String courseId, String status) {
        CourseRequest req = new CourseRequest();
        req.setStudentId(studentId);
        req.setCourseId(courseId);
        req.setStatus(status);
        return req;
    }

    @Test
    void testAddCourseRequests_Success() throws Exception {
        CourseRequest req = buildRequest("B220780CS", "CS201", null);
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/api/coursereq/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(req))))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"message\":\"Course request submitted successfully!\"}"));
    }

    @Test
    void testAddCourseRequests_Conflict() throws Exception {
        CourseRequest req = buildRequest("B220780CS", "CS201", null);
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.of(req));

        mockMvc.perform(post("/api/coursereq/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(req))))
                .andExpect(status().isConflict())
                .andExpect(content().json("{\"message\":\"You have already requested this course!\"}"));
    }

    @Test
    void testGetApprovedRequestsByStudent() throws Exception {
        CourseRequest req = buildRequest("B220780CS", "CS201", "Approved");
        when(courseRequestRepository.findByStudentIdAndStatus("B220780CS", "Approved"))
                .thenReturn(List.of(req));

        mockMvc.perform(get("/api/coursereq/approved/B220780CS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value("CS201"));
    }

    @Test
    void testGetApprovedRequestsByInvalidStudent() throws Exception {
        when(courseRequestRepository.findByStudentIdAndStatus("INVALID", "Approved"))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/coursereq/approved/INVALID"))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test
    void testApproveCourseRequest() throws Exception {
        CourseRequest req = buildRequest("B220780CS", "CS201", "Pending");
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.of(req));

        mockMvc.perform(put("/api/coursereq/approve/B220780CS/CS201"))
                .andExpect(status().isOk())
                .andExpect(content().string("Course request approved"));
    }

    @Test
    void testApproveCourseRequest_NotFound() throws Exception {
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/coursereq/approve/B220780CS/CS201"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testApproveAlreadyApprovedCourse() throws Exception {
        CourseRequest req = buildRequest("B220780CS", "CS201", "Approved");
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.of(req));

        mockMvc.perform(put("/api/coursereq/approve/B220780CS/CS201"))
                .andExpect(status().isOk())
                .andExpect(content().string("Course request approved"));
    }

    @Test
    void testRejectCourseRequest() throws Exception {
        CourseRequest req = buildRequest("B220780CS", "CS201", "Pending");
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.of(req));

        mockMvc.perform(put("/api/coursereq/reject/B220780CS/CS201"))
                .andExpect(status().isOk())
                .andExpect(content().string("Course request rejected"));
    }

    @Test
    void testRejectCourseRequest_NotFound() throws Exception {
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/coursereq/reject/B220780CS/CS201"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testRejectAlreadyRejectedCourse() throws Exception {
        CourseRequest req = buildRequest("B220780CS", "CS201", "Rejected");
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.of(req));

        mockMvc.perform(put("/api/coursereq/reject/B220780CS/CS201"))
                .andExpect(status().isOk())
                .andExpect(content().string("Course request rejected"));
    }

    @Test
    void testGetAllCourseRequests() throws Exception {
        CourseRequest req = buildRequest("B220780CS", "CS201", null);
        when(courseRequestRepository.findAll()).thenReturn(List.of(req));

        mockMvc.perform(get("/api/coursereq/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value("B220780CS"));
    }

    @Test
    void testAddCourseRequests_InvalidJson() throws Exception {
        String invalidJson = "[{\"studentId\":\"B220780CS\"}]"; // Missing courseId

        mockMvc.perform(post("/api/coursereq/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAddCourseRequests_EmptyList() throws Exception {
        mockMvc.perform(post("/api/coursereq/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAddCourseRequests_NullBody() throws Exception {
        mockMvc.perform(post("/api/coursereq/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("null"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAddCourseRequests_MissingStudentId() throws Exception {
        String json = "[{\"courseId\":\"CS201\"}]";

        mockMvc.perform(post("/api/coursereq/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAddMultipleCourseRequests_Success() throws Exception {
        CourseRequest r1 = buildRequest("B220780CS", "CS201", null);
        CourseRequest r2 = buildRequest("B220780CS", "CS202", null);

        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS201"))
                .thenReturn(Optional.empty());
        when(courseRequestRepository.findByStudentIdAndCourseId("B220780CS", "CS202"))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/api/coursereq/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(r1, r2))))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"message\":\"Course request submitted successfully!\"}"));
    }
}
