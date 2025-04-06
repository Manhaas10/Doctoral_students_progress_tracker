package com.demo.rbac.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.demo.rbac.model.Results;

@Repository
public interface ResultsRepository extends JpaRepository<Results, String> {
}
