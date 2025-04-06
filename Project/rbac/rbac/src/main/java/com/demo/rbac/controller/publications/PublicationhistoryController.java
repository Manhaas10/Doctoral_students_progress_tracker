package com.demo.rbac.controller.publications;

import com.demo.rbac.dto.PublicationhRequest;
import com.demo.rbac.model.Publicationhistory;
import com.demo.rbac.service.publications.PublicationhistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/publications/history")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicationhistoryController {

    private final PublicationhistoryService publicationhistoryService;

    public PublicationhistoryController(PublicationhistoryService publicationhistoryService) {
        this.publicationhistoryService = publicationhistoryService;
    }

    // ✅ Store a new publication history entry only if changes exist
    @PostMapping("/add")
    public ResponseEntity<?> addPublicationHistory(@RequestBody PublicationhRequest request) {
        try {
            // Fetch the latest history entry for the given title & roll number
            Optional<Publicationhistory> latestHistory = publicationhistoryService.getLatestHistoryByTitleAndRollNo(request.getTitle(), request.getRollNo());

            if (latestHistory.isPresent()) {
                Publicationhistory existingEntry = latestHistory.get();

                // ✅ If the latest entry has the same status and submission date, do NOT insert a duplicate
                if (existingEntry.getStatus().equals(request.getStatus()) &&
                        existingEntry.getDateOfSubmission().equals(request.getDateOfSubmission())) {
                    return ResponseEntity.status(HttpStatus.OK)
                            .body(Collections.singletonMap("message", "No changes detected, history entry not added."));
                }
            }

            // ✅ If no duplicate exists, save the new entry
            Publicationhistory newHistoryEntry = new Publicationhistory();
            newHistoryEntry.setTitle(request.getTitle());
            newHistoryEntry.setPublishername(request.getPublishername());
            newHistoryEntry.setJournal(request.getJournal());
            newHistoryEntry.setDoi(request.getDoi());
            newHistoryEntry.setPublicationType(request.getPublicationType());
            newHistoryEntry.setStatus(request.getStatus());
            newHistoryEntry.setIndexing(request.getIndexing());
            newHistoryEntry.setQuartile(request.getQuartile());
            newHistoryEntry.setRollNo(request.getRollNo());
            newHistoryEntry.setDateOfSubmission(request.getDateOfSubmission());

            Publicationhistory savedHistoryEntry = publicationhistoryService.saveNewPublicationHistory(newHistoryEntry);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedHistoryEntry);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to create publication history entry"));
        }
    }
    @GetMapping("/student/{rollNo}")
    public ResponseEntity<?> getPublicationHistoryByRollNo(@PathVariable String rollNo) {
    List<Publicationhistory> historyEntries = publicationhistoryService.getHistoryByRollNo(rollNo);
    
    if (historyEntries.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Collections.singletonMap("error", "No publication history found for this roll number"));
    }
    
    return ResponseEntity.ok(historyEntries);
}
}
