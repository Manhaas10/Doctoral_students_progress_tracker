package com.demo.rbac.repository.CompreExam;

import com.demo.rbac.model.CompreExam.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByStudentEmail(String email);

    List<Application> findByGuideId(Long guideId);
}
