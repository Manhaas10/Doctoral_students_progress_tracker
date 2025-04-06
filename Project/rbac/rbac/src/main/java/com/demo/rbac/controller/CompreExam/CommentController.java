package com.demo.rbac.controller.CompreExam;

import com.demo.rbac.model.CompreExam.Comment;
import com.demo.rbac.service.CompreExam.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Endpoint for a student to add a comment to an exam announcement
    @PostMapping("/{examId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long examId,
                                        @RequestBody CommentRequest commentRequest) {
        Comment savedComment = commentService.saveComment(
                examId,
                commentRequest.getStudentEmail(),
                commentRequest.getComment()
        );
        return ResponseEntity.ok(savedComment);
    }

    // Endpoint for coordinator to retrieve all comments for a given exam announcement
    @GetMapping("/{examId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long examId) {
        List<Comment> comments = commentService.getCommentsByExamAnnouncementId(examId);
        return ResponseEntity.ok(comments);
    }

    // DTO for comment request
    public static class CommentRequest {
        private String studentEmail;
        private String comment;

        public String getStudentEmail() {
            return studentEmail;
        }
        public void setStudentEmail(String studentEmail) {
            this.studentEmail = studentEmail;
        }
        public String getComment() {
            return comment;
        }
        public void setComment(String comment) {
            this.comment = comment;
        }
    }

}

