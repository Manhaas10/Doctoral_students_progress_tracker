package com.demo.rbac.controller;

import com.demo.rbac.model.DCMeeting;
import com.demo.rbac.model.Student;
import com.demo.rbac.repository.DCMeetingRepository;
import com.demo.rbac.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dc-meetings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DCMeetingController {

    @Autowired
    private DCMeetingRepository dcMeetingRepository;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/create")
    public ResponseEntity<String> createMeeting(@RequestParam("date") String date,
                                                @RequestParam("time") String time,
                                                @RequestParam("writeup") String writeup,
                                                @RequestParam(value = "file", required = false) MultipartFile file,
                                                @RequestParam("status") String status,
                                                Principal principal) throws IOException {
        DCMeeting meeting = new DCMeeting();
        meeting.setStudentEmail(principal.getName());
        meeting.setDate(LocalDate.parse(date));
        meeting.setTime(LocalTime.parse(time));
        meeting.setWriteup(writeup);
        meeting.setStatus(status);

        System.out.println("entering post construct");
        if (file != null && !file.isEmpty()) {
            System.out.println("dccontroller: " + file.getOriginalFilename());
            meeting.setFileName(file.getOriginalFilename());
            meeting.setFileData(file.getBytes());
        }

        dcMeetingRepository.save(meeting);
        return ResponseEntity.ok("Meeting created successfully");
    }

    @GetMapping("/fetch")
    public ResponseEntity<List<Map<String, Object>>> fetchMeetings(Principal principal) {
        String studentEmail = principal.getName();
        List<DCMeeting> meetings = dcMeetingRepository.findByStudentEmail(studentEmail);

        List<Map<String, Object>> response = meetings.stream().map(meeting -> {
            Map<String, Object> meetingMap = new HashMap<>();
            meetingMap.put("id", meeting.getId());
            meetingMap.put("date", meeting.getDate().toString());
            meetingMap.put("time", meeting.getTime() != null ? meeting.getTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")) : null);
            meetingMap.put("writeup", meeting.getWriteup());
            meetingMap.put("status", meeting.getStatus());
            meetingMap.put("studentEmail", meeting.getStudentEmail());
            meetingMap.put("fileName", meeting.getFileName());
            meetingMap.put("comments", meeting.getComments());
            return meetingMap;
        }).collect(Collectors.toList());

        System.out.println("Meeting Map: " + response);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateMeeting(
            @PathVariable Long id,
            @RequestParam("date") String date,
            @RequestParam("time") String time,
            @RequestParam("writeup") String writeup,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("status") String status,
            Principal principal) throws IOException {

        Optional<DCMeeting> meetingOptional = dcMeetingRepository.findById(id);

        if (meetingOptional.isPresent()) {
            DCMeeting meeting = meetingOptional.get();

            if (!meeting.getStudentEmail().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            meeting.setDate(LocalDate.parse(date));
            meeting.setTime(LocalTime.parse(time));
            meeting.setWriteup(writeup);
            meeting.setStatus(status);

            if (file != null && !file.isEmpty()) {
                meeting.setFileName(file.getOriginalFilename());
                // Uncomment the following if storing file data as a BLOB:
                meeting.setFileData(file.getBytes());
            }

            dcMeetingRepository.save(meeting);
            return ResponseEntity.ok("Meeting updated successfully");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Meeting not found");
    }

    @PutMapping("/submit/{id}")
    public ResponseEntity<String> submitMeeting(@PathVariable Long id, Principal principal) {
        Optional<DCMeeting> meetingOptional = dcMeetingRepository.findById(id);

        if (meetingOptional.isPresent()) {
            DCMeeting meeting = meetingOptional.get();

            if (!meeting.getStudentEmail().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            meeting.setStatus("submitted");
            dcMeetingRepository.save(meeting);

            return ResponseEntity.ok("Meeting status updated to Submitted successfully");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Meeting not found");
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id, Principal principal) {
        DCMeeting meeting = dcMeetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        String loggedInEmail = principal.getName();

        // Check if the user is the student who uploaded the file
        if (meeting.getStudentEmail().equals(loggedInEmail)) {
            return prepareFileDownload(meeting);
        }

        // Check if the user is a supervisor of that student
        Student student = studentRepository.findByEmail(meeting.getStudentEmail())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getGuide().getEmail().equals(loggedInEmail)) {
            return prepareFileDownload(meeting);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    private ResponseEntity<byte[]> prepareFileDownload(DCMeeting meeting) {
        if (meeting.getFileData() == null) {
            throw new RuntimeException("No file data found for this meeting");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename(meeting.getFileName()).build());

        return new ResponseEntity<>(meeting.getFileData(), headers, HttpStatus.OK);
    }

    // ---------------------------------------------
    // Supervisor side endpoints
    // ---------------------------------------------

    @GetMapping("/fetch-for-supervisor")
    public ResponseEntity<List<DCMeeting>> fetchMeetingsForSupervisor(Principal principal) {
        // The supervisor’s email is principal.getName()
        String supervisorEmail = principal.getName();

        // Get all students whose guide's email equals the supervisor's email.
        // Make sure your StudentRepository has the method: findByGuide_Email(String email)
        List<Student> students = studentRepository.findByGuide_Email(supervisorEmail);

        // Extract the emails of these students
        List<String> studentEmails = students.stream()
                .map(Student::getEmail)
                .collect(Collectors.toList());

        // Fetch all DCMeetings for these student emails
        List<DCMeeting> allMeetings = dcMeetingRepository.findByStudentEmailIn(studentEmails);

        return ResponseEntity.ok(allMeetings);
    }

    @PutMapping("/supervisor-action/{id}")
    public ResponseEntity<String> updateMeetingStatusBySupervisor(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Principal principal) {

        DCMeeting meeting = dcMeetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        // Check if the logged-in supervisor is actually the guide of the student
        String supervisorEmail = principal.getName();
        Student student = studentRepository.findByEmail(meeting.getStudentEmail())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (!student.getGuide().getEmail().equals(supervisorEmail)) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.FORBIDDEN);
        }

        String newStatus = request.get("status");  // e.g. "approved", "rejected", "resubmit"
        meeting.setStatus(newStatus);

        if (request.containsKey("comments")) {
            meeting.setComments(request.get("comments"));
        }

        dcMeetingRepository.save(meeting);
        return ResponseEntity.ok("Status updated to " + newStatus);
    }
}
