package com.demo.rbac.repository;

import com.demo.rbac.model.Publicationhistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PublicationhRepository extends JpaRepository<Publicationhistory, Long> {

    // ✅ Find publications by rollNo
    List<Publicationhistory> findByRollNo(String rollNo);
    int countByRollNo(String rollNo);
    // @Query("SELECT p FROM Publicationhistory p WHERE p.title = :title ORDER BY p.dateOfSubmission DESC LIMIT 1")
    // Optional<Publicationhistory> findLatestByTitle(@Param("title") String title);
    Optional<Publicationhistory> findTopByTitleAndRollNoOrderByIdDesc(String title, String rollNo);

}
