package com.demo.rbac.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.demo.rbac.model.CourseRequest;

@Repository
public interface CourseRequestRepository extends JpaRepository<CourseRequest, Long> {
    List<CourseRequest> findByStudentId(String studentId);
    Optional<CourseRequest> findByStudentIdAndCourseId(String studentId, String courseId); 
    List<CourseRequest> findByStudentIdAndStatus(String studentId, String status);
}
