package com.demo.rbac.service.CompreExam;

import com.demo.rbac.model.CompreExam.Comment;
import com.demo.rbac.model.CompreExam.ExamAnnouncement;
import com.demo.rbac.repository.CompreExam.CommentRepository;
import com.demo.rbac.repository.CompreExam.ExamAnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ExamAnnouncementRepository examRepository;

    // Save a new comment for a given exam announcement
    public Comment saveComment(Long examAnnouncementId, String studentEmail, String commentText) {
        ExamAnnouncement exam = examRepository.findById(examAnnouncementId)
                .orElseThrow(() -> new RuntimeException("Exam announcement not found"));
        Comment comment = new Comment();
        comment.setExamAnnouncement(exam);
        comment.setStudentEmail(studentEmail);
        comment.setComment(commentText);
        return commentRepository.save(comment);
    }

    // Retrieve comments for a specific exam announcement
    public List<Comment> getCommentsByExamAnnouncementId(Long examAnnouncementId) {
        return commentRepository.findByExamAnnouncementId(examAnnouncementId);
    }

}


