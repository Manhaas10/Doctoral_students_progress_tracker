package com.demo.rbac.service.CompreExam;

import com.demo.rbac.model.CompreExam.ExamAnnouncement;
import com.demo.rbac.repository.CompreExam.ExamAnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamAnnouncementService {

    @Autowired
    private ExamAnnouncementRepository repository;

    public ExamAnnouncement saveExamAnnouncement(ExamAnnouncement examAnnouncement) {
        // Optionally add business logic here
        return repository.save(examAnnouncement);
    }

    public List<ExamAnnouncement> getAllExamAnnouncements() {
        return repository.findAll();
    }

    public ExamAnnouncement updateExamAnnouncement(Long id, ExamAnnouncement updatedExam) {
        return repository.findById(id).map(existing -> {
            existing.setName(updatedExam.getName());
            existing.setExamDate(updatedExam.getExamDate());
            existing.setDeadline(updatedExam.getDeadline());
            existing.setExamVenue(updatedExam.getExamVenue());
            existing.setExamDuration(updatedExam.getExamDuration());
            existing.setExamShift(updatedExam.getExamShift());
            existing.setBroadcast(updatedExam.isBroadcast());
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Exam not found with id " + id));
    }

    public void deleteExamAnnouncement(Long id) {
        repository.deleteById(id);
    }

}


