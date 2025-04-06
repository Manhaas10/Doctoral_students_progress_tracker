package com.demo.rbac.controller.CompreExam;

import com.demo.rbac.model.CompreExam.ExamAnnouncement;
import com.demo.rbac.service.CompreExam.ExamAnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamAnnoucementController {

    @Autowired
    private ExamAnnouncementService examService;

    @PostMapping("/announce")
    public ResponseEntity<?> announceExam(@RequestBody ExamAnnouncement examAnnouncement) {
        if (!examAnnouncement.isBroadcast()) {
            System.out.println("not null broadcast post req");
            return ResponseEntity.badRequest().body("Exam announcement must be broadcasted.");
        }
        ExamAnnouncement savedExam = examService.saveExamAnnouncement(examAnnouncement);
        return ResponseEntity.ok(savedExam);
    }

    @GetMapping
    public ResponseEntity<List<ExamAnnouncement>> getExams() {
        List<ExamAnnouncement> exams = examService.getAllExamAnnouncements();
        return ResponseEntity.ok(exams);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExam(@PathVariable Long id, @RequestBody ExamAnnouncement examAnnouncement) {
        ExamAnnouncement updated = examService.updateExamAnnouncement(id, examAnnouncement);
        return ResponseEntity.ok(updated);
    }

}

