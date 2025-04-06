package com.demo.rbac.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.demo.rbac.model.CourseRequest;
import com.demo.rbac.repository.CourseRequestRepository;

@RestController
@RequestMapping("/api/coursereq")
public class CourseRequestController {

    @Autowired
    private CourseRequestRepository courseRequestRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addCourseRequests(@RequestBody List<CourseRequest> requests) {  
        if (requests == null || requests.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{ \"message\": \"No course requests provided.\" }");
        }

        for (CourseRequest request : requests) {
            Optional<CourseRequest> existingRequest = 
                courseRequestRepository.findByStudentIdAndCourseId(request.getStudentId(), request.getCourseId());

            if (existingRequest.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("{ \"message\": \"You have already requested this course!\" }");
            }

            request.setStatus("Pending");
        }

        courseRequestRepository.saveAll(requests);
        return ResponseEntity.ok("{ \"message\": \"Course request submitted successfully!\" }");
    }
    @GetMapping("/approved/{studentId}")
public ResponseEntity<List<CourseRequest>> getApprovedRequestsByStudent(@PathVariable String studentId) {
    studentId = studentId.trim(); // Trim any extra spaces or newlines
    List<CourseRequest> requests = courseRequestRepository.findByStudentIdAndStatus(studentId, "Approved");
    return ResponseEntity.ok(requests);
}

    @GetMapping("/status/{studentId}")
    public ResponseEntity<List<CourseRequest>> getRequestsByStudent(@PathVariable String studentId) {
        System.out.println("Received studentId: [" + studentId + "]");
        studentId = studentId.trim(); // Trim any extra spaces or newlines
        List<CourseRequest> requests = courseRequestRepository.findByStudentId(studentId);
        System.out.println("Requests found: " + requests);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/approve/{studentId}/{courseId}")
    public ResponseEntity<String> approveRequest(@PathVariable String studentId, @PathVariable String courseId) {
        Optional<CourseRequest> optionalRequest = courseRequestRepository.findByStudentIdAndCourseId(studentId, courseId);
    
        if (optionalRequest.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course request not found");
        }
    
        CourseRequest request = optionalRequest.get();
    
        if ("Approved".equals(request.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Request is already approved");
        }
    
        request.setStatus("Approved");
        courseRequestRepository.save(request);
    
        return ResponseEntity.ok("Course request approved");
    }
    
    @PutMapping("/reject/{studentId}/{courseId}")
    public ResponseEntity<String> rejectRequest(@PathVariable String studentId, @PathVariable String courseId) {
        Optional<CourseRequest> optionalRequest = courseRequestRepository.findByStudentIdAndCourseId(studentId, courseId);
    
        if (optionalRequest.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course request not found");
        }
    
        CourseRequest request = optionalRequest.get();
    
        if ("Rejected".equals(request.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Request is already rejected");
        }
    
        request.setStatus("Rejected");
        courseRequestRepository.save(request);
    
        return ResponseEntity.ok("Course request rejected");
    }
    @GetMapping("/all")
    public ResponseEntity<List<CourseRequest>> getAllCourseRequests() {
    List<CourseRequest> requests = courseRequestRepository.findAll();
    return ResponseEntity.ok(requests);
}
    
}
