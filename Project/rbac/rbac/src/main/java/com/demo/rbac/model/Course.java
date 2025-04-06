package com.demo.rbac.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    private String id; // Example: P202300CS
    private String Dept;
    private String course_name;
    private String SME_Name;
    private String Institute;
    private String Co_Institute;
    private String Duration;
    private String TypeofCourse;
    private String StartDate;
    private String EndDate;
    private String ExamDate;

    // Default Constructor
    public Course() {
    }

    // Parameterized Constructor
    public Course(String id, String dept, String course_name, String SME_Name, String Institute, 
                  String Co_Institute, String Duration, String TypeofCourse, 
                  String StartDate, String EndDate, String ExamDate) {
        this.id = id;
        this.Dept = dept;
        this.course_name = course_name;
        this.SME_Name = SME_Name;
        this.Institute = Institute;
        this.Co_Institute = Co_Institute;
        this.Duration = Duration;
        this.TypeofCourse = TypeofCourse;
        this.StartDate = StartDate;
        this.EndDate = EndDate;
        this.ExamDate = ExamDate;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getDept() {
        return Dept;
    }

    public String getCourse_name() {
        return course_name;
    }

    public String getSME_Name() {
        return SME_Name;
    }

    public String getInstitute() {
        return Institute;
    }

    public String getCo_Institute() {
        return Co_Institute;
    }

    public String getDuration() {
        return Duration;
    }

    public String getTypeofCourse() {
        return TypeofCourse;
    }

    public String getStartDate() {
        return StartDate;
    }

    public String getEndDate() {
        return EndDate;
    }

    public String getExamDate() {
        return ExamDate;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setDept(String dept) {
        this.Dept = dept;
    }

    public void setCourse_name(String course_name) {
        this.course_name = course_name;
    }

    public void setSME_Name(String SME_Name) {
        this.SME_Name = SME_Name;
    }

    public void setInstitute(String institute) {
        this.Institute = institute;
    }

    public void setCo_Institute(String co_Institute) {
        this.Co_Institute = co_Institute;
    }

    public void setDuration(String duration) {
        this.Duration = duration;
    }

    public void setTypeofCourse(String typeofCourse) {
        this.TypeofCourse = typeofCourse;
    }

    public void setStartDate(String startDate) {
        this.StartDate = startDate;
    }

    public void setEndDate(String endDate) {
        this.EndDate = endDate;
    }

    public void setExamDate(String examDate) {
        this.ExamDate = examDate;
    }

    // toString() method for debugging
    @Override
    public String toString() {
        return "Course{" +
                "id='" + id + '\'' +
                ", Dept='" + Dept + '\'' +
                ", course_name='" + course_name + '\'' +
                ", SME_Name='" + SME_Name + '\'' +
                ", Institute='" + Institute + '\'' +
                ", Co_Institute='" + Co_Institute + '\'' +
                ", Duration='" + Duration + '\'' +
                ", TypeofCourse='" + TypeofCourse + '\'' +
                ", StartDate='" + StartDate + '\'' +
                ", EndDate='" + EndDate + '\'' +
                ", ExamDate='" + ExamDate + '\'' +
                '}';
    }
}
