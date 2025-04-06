package com.demo.rbac.repository;

import com.demo.rbac.model.DCMeeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DCMeetingRepository extends JpaRepository<DCMeeting, Long> {
    List<DCMeeting> findByStudentEmailAndStatus(String studentEmail, String status);
    List<DCMeeting> findByStudentEmail(String studentEmail);

    List<DCMeeting> findByStudentEmailIn(List<String> studentEmails);
}
