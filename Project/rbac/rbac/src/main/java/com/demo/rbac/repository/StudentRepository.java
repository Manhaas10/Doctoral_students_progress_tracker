package com.demo.rbac.repository;

import com.demo.rbac.dto.StudentGuideDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.demo.rbac.model.Student;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    @Query("SELECT new com.demo.rbac.dto.StudentGuideDTO(s.id, s.name, s.email, s.admissionscheme, s.orcid, s.areaofresearch, s.dateofjoin, g.name, g.email) " +
            "FROM Student s LEFT JOIN s.guide g")
    List<StudentGuideDTO> findAllWithGuides();

    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
    
    @Query("SELECT s.roll, s.name, s.orcid, COUNT(p.id) " +
           "FROM Student s LEFT JOIN Publication p ON s.roll = p.rollNo " +  // Fixed JOIN
           "WHERE s.guide.id = :guideId " +
           "GROUP BY s.roll, s.name, s.orcid")
    List<Object[]> findStudentsByGuideWithPublicationCount(@Param("guideId") Long guideId);
    List<Student> findByGuide_Email(String email);
    // ✅ Find student by roll number
    @Query("SELECT s FROM Student s WHERE s.roll = :roll")
    Optional<Student> findByRollNo(@Param("roll") String roll);
}
