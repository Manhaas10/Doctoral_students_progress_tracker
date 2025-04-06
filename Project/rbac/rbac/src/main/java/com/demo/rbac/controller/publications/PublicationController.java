package com.demo.rbac.controller.publications;

import com.demo.rbac.dto.PublicationRequest;
import com.demo.rbac.model.Publication;
import com.demo.rbac.service.publications.PublicationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/publications")
@CrossOrigin(origins = "http://localhost:5173") // Adjust as needed
public class PublicationController {

    private final PublicationService publicationService;

    public PublicationController(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    // ✅ Add a new publication (ensure rollNo is present)
    @PostMapping("/add")
    public ResponseEntity<?> addPublication(@RequestBody PublicationRequest request) {
        try {
            // Save the publication using the service method that accepts PublicationRequest
            Publication publication = publicationService.savePublication(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(publication);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to save publication"));
        }
    }

    // ✅ Update publication status
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePublicationStatus(
            @PathVariable Long id,
            @RequestBody PublicationRequest updatedPublicationRequest
    ) {
        Optional<Publication> existingPublication = publicationService.getPublicationById(id);
        if (existingPublication.isPresent()) {
            Publication existingPublicationEntity = existingPublication.get();
            // Update only the status and ensure other fields remain unchanged
            existingPublicationEntity.setStatus(updatedPublicationRequest.getStatus()); // Update only status
            // Save the updated publication
            Publication updatedPublication = publicationService.savePublication(existingPublicationEntity);
            return ResponseEntity.ok(updatedPublication);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Collections.singletonMap("error", "Publication not found"));
    }

    // ✅ Get all publications by rollNo
    @GetMapping("/get/{rollNo}")
    public ResponseEntity<?> getPublicationsByRollNo(@PathVariable String rollNo) {
        List<Publication> publications = publicationService.getPublicationsByRollNo(rollNo);
        
        if (publications.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "No publications found for this roll number"));
        }
        
        return ResponseEntity.ok(publications);
    }
}
