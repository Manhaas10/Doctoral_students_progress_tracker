package com.demo.rbac.repository;

import com.demo.rbac.model.Guide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GuideRepository extends JpaRepository<Guide, Long> {
    Optional<Guide> findByEmail(String email);

    @Query("SELECT g.id FROM Guide g WHERE g.email = :email")
    Optional<Long> findGuideIdByEmail(@Param("email") String email);
}
