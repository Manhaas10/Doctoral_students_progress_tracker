package com.demo.rbac.repository;

import com.demo.rbac.model.DoctoralCommittee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctoralCommitteeRepository extends JpaRepository<DoctoralCommittee, Long> {
    DoctoralCommittee findByStudentId(String studentId);
}
