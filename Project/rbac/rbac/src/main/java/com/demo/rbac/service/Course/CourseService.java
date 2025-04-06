package com.demo.rbac.service.Course;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.demo.rbac.model.Course;
import com.demo.rbac.repository.CourseRepository;
import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository; // ✅ Corrected variable naming convention

    public List<Course> saveCoursesFromExcel(MultipartFile file) {
        try {
            if (!Coursehelper.hasExcelFormat(file)) {
                throw new IllegalArgumentException("Invalid Excel file format.");
            }
    
            List<Course> courses = Coursehelper.excelToCourses(file.getInputStream());

            if (courses.isEmpty()) {
                throw new RuntimeException("No valid courses found in the uploaded file.");
            }

            return courseRepository.saveAll(courses);  // ✅ Save and return the list
        } catch (Exception e) {
            throw new RuntimeException("Error processing Excel file: " + e.getMessage(), e);
        }
    }

    public List<Course> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        if (courses.isEmpty()) {
            throw new RuntimeException("No courses found in the database.");
        }
        return courses;
    }
}
