package com.demo.rbac.repository.CompreExam;

import com.demo.rbac.model.CompreExam.ExamAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamAnnouncementRepository extends JpaRepository<ExamAnnouncement, Long> {
}
