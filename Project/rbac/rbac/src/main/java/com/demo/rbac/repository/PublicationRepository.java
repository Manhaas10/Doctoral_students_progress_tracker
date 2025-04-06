package com.demo.rbac.repository;

import com.demo.rbac.model.Publication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PublicationRepository extends JpaRepository<Publication, Long> {

    // ✅ Find publications by rollNo
    List<Publication> findByRollNo(String rollNo);
    int countByRollNo(String rollNo);
}
