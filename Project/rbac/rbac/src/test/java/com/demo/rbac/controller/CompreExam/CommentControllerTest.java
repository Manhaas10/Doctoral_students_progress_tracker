package com.demo.rbac.controller.CompreExam;

import com.demo.rbac.model.CompreExam.Comment;
import com.demo.rbac.model.CompreExam.ExamAnnouncement;
import com.demo.rbac.service.CompreExam.CommentService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommentController.class)
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private CommentService commentService;

    @Autowired
    private ObjectMapper objectMapper;

    private CommentController.CommentRequest commentRequest;
    private Comment sampleComment;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        commentRequest = new CommentController.CommentRequest();
        commentRequest.setStudentEmail("student@example.com");
        commentRequest.setComment("This is a test comment");

        ExamAnnouncement exam = new ExamAnnouncement();
        exam.setId(101L);
        exam.setName("Comprehensive Exam");

        sampleComment = new Comment();
        sampleComment.setId(1L);
        sampleComment.setExamAnnouncement(exam);
        sampleComment.setStudentEmail("student@example.com");
        sampleComment.setComment("This is a test comment");
        sampleComment.setTimestamp(LocalDateTime.now());
    }

    // ✅ Positive: Post comment
    @Test
    void testAddComment() throws Exception {
        Mockito.when(commentService.saveComment(eq(101L), eq("student@example.com"), eq("This is a test comment")))
                .thenReturn(sampleComment);

        mockMvc.perform(post("/api/exams/101/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentEmail").value("student@example.com"))
                .andExpect(jsonPath("$.comment").value("This is a test comment"));
    }

    // ✅ Positive: Get comments list
    @Test
    void testGetComments() throws Exception {
        Mockito.when(commentService.getCommentsByExamAnnouncementId(101L))
                .thenReturn(List.of(sampleComment));

        mockMvc.perform(get("/api/exams/101/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value("student@example.com"))
                .andExpect(jsonPath("$[0].comment").value("This is a test comment"));
    }

    // ❌ Negative: Missing studentEmail (should return 400)
    @Test
    void testAddCommentMissingEmail() throws Exception {
        commentRequest.setStudentEmail(null);

        mockMvc.perform(post("/api/exams/101/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isBadRequest());
    }

    // ❌ Negative: Missing comment content (should return 400)
    @Test
    void testAddCommentMissingContent() throws Exception {
        commentRequest.setComment("");

        mockMvc.perform(post("/api/exams/101/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isBadRequest());
    }

    // ❌ Negative: Invalid content type
    @Test
    void testAddCommentInvalidContentType() throws Exception {
        mockMvc.perform(post("/api/exams/101/comments")
                        .content("raw string data"))
                .andExpect(status().isUnsupportedMediaType());
    }

    // ✅ Edge: Very long comment
    @Test
    void testAddVeryLongComment() throws Exception {
        StringBuilder longComment = new StringBuilder();
        for (int i = 0; i < 10000; i++) {
            longComment.append("a");
        }
        commentRequest.setComment(longComment.toString());

        Mockito.when(commentService.saveComment(eq(101L), eq("student@example.com"), any()))
                .thenReturn(sampleComment);

        mockMvc.perform(post("/api/exams/101/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isOk());
    }

    // ✅ Edge: No comments for exam
    @Test
    void testGetCommentsEmpty() throws Exception {
        Mockito.when(commentService.getCommentsByExamAnnouncementId(202L))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/exams/202/comments"))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    // ✅ Edge: Multiple comments
    @Test
    void testGetMultipleComments() throws Exception {
        Comment secondComment = new Comment();
        secondComment.setId(2L);
        secondComment.setStudentEmail("another@student.com");
        secondComment.setComment("Second comment");
        secondComment.setTimestamp(LocalDateTime.now());

        Mockito.when(commentService.getCommentsByExamAnnouncementId(101L))
                .thenReturn(List.of(sampleComment, secondComment));

        mockMvc.perform(get("/api/exams/101/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].studentEmail").value("another@student.com"));
    }
}
