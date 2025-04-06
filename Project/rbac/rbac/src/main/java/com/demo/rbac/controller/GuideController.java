package com.demo.rbac.controller;

import java.util.List;
import java.util.Map;

import com.demo.rbac.dto.GuideDTO;
import com.demo.rbac.model.Guide;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.demo.rbac.dto.StudentUnderGuideDTO;
import com.demo.rbac.service.GuideService;
import com.demo.rbac.service.student.StudentService;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/guides")
public class GuideController {

    private final StudentService studentService;
    private final GuideService guideService;

    public GuideController(StudentService studentService, GuideService guideService) {
        this.studentService = studentService;
        this.guideService = guideService;
    }

    @GetMapping("/{guideId}/students")
public ResponseEntity<List<StudentUnderGuideDTO>> getStudentsUnderGuide(@PathVariable Long guideId) {
    List<StudentUnderGuideDTO> students = studentService.getStudentsUnderGuide(guideId);
    System.out.println("Returning students: " + students); // ✅ Debug log
    return ResponseEntity.ok(students);
}

@GetMapping("/{guideId}")
public ResponseEntity<GuideDTO> getGuideById(@PathVariable Long guideId) {
    GuideDTO guide = guideService.getGuideById(guideId);
    return (guide != null) ? ResponseEntity.ok(guide) : ResponseEntity.notFound().build();
}

    @GetMapping("/email/{email}")
    public ResponseEntity<Long> getGuideIdByEmail(@PathVariable String email) {
        Long guideId = guideService.getGuideIdByEmail(email);
        return (guideId != null) ? ResponseEntity.ok(guideId) : ResponseEntity.notFound().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Long> getMyId(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        System.out.println("entering guide me" + email);
        Long guideId = guideService.getGuideIdByEmail(email);

        if (guideId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null); // Or ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(guideId);
    }

}
