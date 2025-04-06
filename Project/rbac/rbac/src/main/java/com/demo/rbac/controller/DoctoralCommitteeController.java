package com.demo.rbac.controller;

import com.demo.rbac.model.CommitteeMember;
import com.demo.rbac.model.DoctoralCommittee;
import com.demo.rbac.repository.DoctoralCommitteeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students/{studentId}/dc")
public class DoctoralCommitteeController {

    private final DoctoralCommitteeRepository repository;

    public DoctoralCommitteeController(DoctoralCommitteeRepository repository) {
        this.repository = repository;
    }

    // GET endpoint to fetch a student's DC details
    @GetMapping("/get-dc")
    public ResponseEntity<?> getDoctoralCommittee(@PathVariable String studentId) {
        DoctoralCommittee dc = repository.findByStudentId(studentId);
        if (dc == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student or Doctoral Committee not found");
        }
        return ResponseEntity.ok(dc);
    }

    // POST endpoint to create a new DC record (for first-time entries)
    @PostMapping("/create-dc")
    public ResponseEntity<?> createDoctoralCommittee(@PathVariable String studentId,
                                                     @RequestBody DoctoralCommittee newDC) {
        // Check if a record already exists
        System.out.println("Entering POST create-dc");
        DoctoralCommittee existing = repository.findByStudentId(studentId);
        if (existing != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Doctoral Committee already exists for this student");
        }
        // For each CommitteeMember in newDC, set the id to null to ensure they are treated as new
        if(newDC.getMembers() != null) {
            newDC.getMembers().forEach(member -> member.setId(null));
        }
        // Set the studentId on the new record
        newDC.setStudentId(studentId);
        // Save the new record
        DoctoralCommittee savedDC = repository.save(newDC);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDC);
    }

    // PUT endpoint to update a student's DC details
    @PutMapping("/put-dc")
    public ResponseEntity<?> updateDoctoralCommittee(@PathVariable String studentId,
                                                     @RequestBody DoctoralCommittee updatedDC) {
        DoctoralCommittee currentDC = repository.findByStudentId(studentId);
        if (currentDC == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student or Doctoral Committee not found");
        }

        // Validate: ensure at least one DC member is present
        if (updatedDC.getMembers() == null || updatedDC.getMembers().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("At least one DC member is required");
        }

        // Check if the DC Chair is being changed and if it has already been changed once
        if (( !updatedDC.getDcChairName().equals(currentDC.getDcChairName()) ||
                !updatedDC.getDcChairEmail().equals(currentDC.getDcChairEmail()))
                && currentDC.isDcChairChanged()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("DC Chair can only be changed once");
        }

        // Check if the PhD Supervisor is being changed and if it has already been changed once
        if (( !updatedDC.getPhdSupervisorName().equals(currentDC.getPhdSupervisorName()) ||
                !updatedDC.getPhdSupervisorEmail().equals(currentDC.getPhdSupervisorEmail()))
                && currentDC.isPhdSupervisorChanged()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("PhD Supervisor can only be changed once");
        }

        // Update DC Chair details if allowed
        if (!updatedDC.getDcChairName().equals(currentDC.getDcChairName()) ||
                !updatedDC.getDcChairEmail().equals(currentDC.getDcChairEmail())) {
            currentDC.setDcChairName(updatedDC.getDcChairName());
            currentDC.setDcChairEmail(updatedDC.getDcChairEmail());
            currentDC.setDcChairChanged(true);
        }

        // Update PhD Supervisor details if allowed
        if (!updatedDC.getPhdSupervisorName().equals(currentDC.getPhdSupervisorName()) ||
                !updatedDC.getPhdSupervisorEmail().equals(currentDC.getPhdSupervisorEmail())) {
            currentDC.setPhdSupervisorName(updatedDC.getPhdSupervisorName());
            currentDC.setPhdSupervisorEmail(updatedDC.getPhdSupervisorEmail());
            currentDC.setPhdSupervisorChanged(true);
        }

        // Instead of replacing the collection, update its contents.
        currentDC.getMembers().clear();
        currentDC.getMembers().addAll(updatedDC.getMembers());

        // Save the changes
        repository.save(currentDC);

        return ResponseEntity.ok(currentDC);
    }

}
