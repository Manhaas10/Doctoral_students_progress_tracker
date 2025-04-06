package com.demo.rbac.controller;

import com.demo.rbac.dto.StudentGuideDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.demo.rbac.model.Student;
import com.demo.rbac.service.student.StudentService;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
// import com.demo.rbac.dto.StudentPublicationDTO;
@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/upload")
    public ResponseEntity<List<Student>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            List<Student> savedStudents = studentService.saveStudentsFromExcel(file);
            return ResponseEntity.ok(savedStudents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

@GetMapping("/{rollNumber}/publications")
public ResponseEntity<Integer> getPublicationCount(@PathVariable String rollNumber) {
    int count = studentService.getPublicationCountForStudent(rollNumber);
    return ResponseEntity.ok(count);
}

    @GetMapping("/all")
    public ResponseEntity<List<StudentGuideDTO>> getAllStudents() {
        List<StudentGuideDTO> students = studentService.getAllStudentsWithGuides();
        return ResponseEntity.ok(students);
    }

    // ✅ Fetch currently authenticated student details
    @GetMapping("/me")
    public ResponseEntity<Student> getCurrentStudent(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    
        String email = principal.getName(); // Spring Security provides the authenticated user's email
        Optional<Student> studentOpt = studentService.findByEmail(email);
    
        return studentOpt.map(ResponseEntity::ok)
                         .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }
    

    @GetMapping("/{rollNumber}")
    public ResponseEntity<Student> getStudentByRollNumber(@PathVariable String rollNumber) {
        System.out.println("Fetching student with roll number: " + rollNumber);
        Optional<Student> student = studentService.getStudentByRollNumber(rollNumber);

        return student.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @PutMapping("/{rollNumber}")
    public ResponseEntity<Student> updateStudent(@PathVariable String rollNumber, @RequestBody Student updatedStudent) {
        Optional<Student> existingStudentOpt = studentService.getStudentByRollNumber(rollNumber);

        if (existingStudentOpt.isPresent()) {
            Student existingStudent = existingStudentOpt.get();

            // ✅ Only update fields if new values are provided
            if (updatedStudent.getOrcid() != null) {
                existingStudent.setOrcid(updatedStudent.getOrcid());
            }
            if (updatedStudent.getAreaofresearch() != null) {
                existingStudent.setAreaofresearch(updatedStudent.getAreaofresearch());
            }

            Student savedStudent = studentService.updateStudent(existingStudent);
            return ResponseEntity.ok(savedStudent);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}
