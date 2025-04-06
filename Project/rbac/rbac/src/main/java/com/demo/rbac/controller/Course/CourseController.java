package com.demo.rbac.controller.Course;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.demo.rbac.model.Course;
import com.demo.rbac.service.Course.CourseService;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    @Autowired
    private CourseService courseService;  // ✅ Fixed naming convention

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty. Please upload a valid Excel file.");
            }

            List<Course> savedCourses = courseService.saveCoursesFromExcel(file);  // ✅ Process file
            return ResponseEntity.ok(savedCourses);  // ✅ Return the saved courses
        } catch (Exception e) {
            logger.error("Error processing Excel file: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error processing file: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCourses() {
        try {
            List<Course> courses = courseService.getAllCourses();  // ✅ Fetch courses
            if (courses.isEmpty()) {
                return ResponseEntity.ok("No courses available.");
            }
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.error("Error retrieving courses: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error retrieving courses: " + e.getMessage());
        }
    }
}
