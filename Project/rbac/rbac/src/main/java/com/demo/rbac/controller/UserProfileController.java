package com.demo.rbac.controller;

import com.demo.rbac.model.Student;
import com.demo.rbac.service.student.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/profile")
    public Map<String, String> getProfile(@AuthenticationPrincipal OAuth2User oAuth2User) {
        if (oAuth2User == null) {
            throw new RuntimeException("User not authenticated");
        }

        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        int endIdx = email.indexOf("nitc.ac.in");
        endIdx--;
        int startIdx = endIdx - 9;
        String rollno = email.substring(startIdx, endIdx).toUpperCase();

        Map<String, String> response = new HashMap<>();
        response.put("name", name);
        response.put("email", email);
        response.put("rollNumber", rollno);

        Optional<Student> studentOpt = studentService.findByEmail(email);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            response.put("orcid", student.getOrcid() != null ? student.getOrcid() : "");
            response.put("areaofresearch", student.getAreaofresearch() != null ? student.getAreaofresearch() : "");

            // Include guide details if present
            if (student.getGuide() != null) {
                response.put("guideName", student.getGuide().getName());
                response.put("guideEmail", student.getGuide().getEmail());
            } else {
                response.put("guideName", "");
                response.put("guideEmail", "");
            }
        } else {
            response.put("orcid", "");
            response.put("areaofresearch", "");
            response.put("guideName", "");
            response.put("guideEmail", "");
        }

        return response;
    }


    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Student updatedStudent) {
        Optional<Student> existingStudent = studentService.findByEmail(updatedStudent.getEmail());

        System.out.println("entering put ");
        if (existingStudent.isPresent()) {
            Student student = existingStudent.get();
            student.setOrcid(updatedStudent.getOrcid());
            student.setAreaofresearch(updatedStudent.getAreaofresearch());
            studentService.saveStudent(student);  // Save updated student

            return ResponseEntity.ok("Profile updated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found.");
        }
    }

}
