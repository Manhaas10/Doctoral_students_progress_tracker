package com.demo.rbac.repository.CompreExam;

import com.demo.rbac.model.CompreExam.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByExamAnnouncementId(Long examAnnouncementId);

}
