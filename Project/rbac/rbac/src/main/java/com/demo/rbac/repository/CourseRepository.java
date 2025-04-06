package com.demo.rbac.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.demo.rbac.model.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
}
