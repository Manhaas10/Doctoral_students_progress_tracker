package com.demo.rbac.controller.CompreExam;

import com.demo.rbac.dto.ApplicationDto;
import com.demo.rbac.model.CompreExam.Application;
import com.demo.rbac.model.CompreExam.SpecializedSyllabus;
import com.demo.rbac.model.Student;
import com.demo.rbac.repository.CompreExam.ApplicationRepository;
import com.demo.rbac.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    @Autowired
    private ApplicationRepository appRepo;

    @Autowired
    private StudentRepository studentRepo;

    @PostMapping("/applications")
    public Application createApplication(@RequestBody ApplicationDto dto) {
        if (dto.getExamId() == null || dto.getStudentEmail() == null) {
            throw new RuntimeException("Missing examId or studentEmail");
        }

        Application application = new Application();
        application.setExamId(dto.getExamId());
         application.setName(dto.getName());
        application.setStudentEmail(dto.getStudentEmail());
        application.setStatus(dto.getStatus());
        application.setDateApplied(LocalDateTime.now());
        application.setGuideComment(dto.getGuideComment());
        application.setShift(dto.getShift());
        Optional<Student> st = studentRepo.findByEmail(dto.getStudentEmail());
        Long guideId = st.get().getGuide().getId();
        application.setGuideId(guideId);
        String studentRollNo = st.get().getRoll();
        String studentName = st.get().getName();
        application.setStudentRoll(studentRollNo);
        application.setStudentName(studentName);

        List<SpecializedSyllabus> syllabusEntities = new ArrayList<>();
        if (dto.getSpecializedSyllabi() != null) {
            for (String text : dto.getSpecializedSyllabi()) {
                SpecializedSyllabus s = new SpecializedSyllabus();
                s.setContent(text);
                s.setApplication(application);
                syllabusEntities.add(s);
            }
        }
        application.getSpecializedSyllabi().addAll(syllabusEntities);
        return appRepo.save(application);
    }

    @GetMapping("/applications/guide/{guideId}")
    public List<Application> getApplicationsForGuide(@PathVariable Long guideId) {
        return appRepo.findByGuideId(guideId);
    }

    // Get applications for a specific student (optional)
    @GetMapping("/applications/student/{email}")
    public List<Application> getStudentApplications(@PathVariable String email) {
        return appRepo.findByStudentEmail(email);
    }

    // Update an application (for editing, approving, rejecting, or resubmission)
    @PutMapping("/applications/{id}")
    public Application updateApplication(@PathVariable Long id, @RequestBody ApplicationDto dto) {
        Application application = appRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Update the status if provided (this can include approval, rejection, or resubmission)
        if(dto.getStatus() != null) {
            application.setStatus(dto.getStatus());
        }

        // Update specialized syllabi if provided
        if(dto.getSpecializedSyllabi() != null) {
            application.getSpecializedSyllabi().clear();
            for(String text : dto.getSpecializedSyllabi()) {
                SpecializedSyllabus s = new SpecializedSyllabus();
                s.setContent(text);
                s.setApplication(application);
                application.getSpecializedSyllabi().add(s);
            }
        }

        if (dto.getGuideComment() != null) {
            application.setGuideComment(dto.getGuideComment());
        }

        // Additional fields can be updated as needed

        return appRepo.save(application);
    }

    @GetMapping("/applications/all")
    public List<ApplicationDto> getAllApplications() {
        List<Application> applications = appRepo.findAll();

        return applications.stream()
                .map(app -> {
                    ApplicationDto dto = new ApplicationDto();
                    dto.setExamId(app.getExamId());
                   dto.setName(app.getName());
                    dto.setStudentEmail(app.getStudentEmail());
                    dto.setSpecializedSyllabi(
                            app.getSpecializedSyllabi().stream()
                                    .map(SpecializedSyllabus::getContent)
                                    .collect(Collectors.toList())
                    );
                    dto.setStatus(app.getStatus());
                    dto.setShift(app.getShift());
                    dto.setGuideComment(app.getGuideComment());
//                    dto.setGuideId(app.get() != null ? app.getGuide().getId() : null);
                    dto.setStudentRoll(app.getStudentRoll());
                    dto.setStudentName(app.getStudentName());
                    dto.setDateApplied(app.getDateApplied());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
