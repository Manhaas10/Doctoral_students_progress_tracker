package com.demo.rbac.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "doctoral_committees")
public class DoctoralCommittee {

    @Id  // Corrected import
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Primary key

    @Column(unique = true, nullable = false)
    private String studentId;

    private String dcChairName;
    private String dcChairEmail;
    private boolean dcChairChanged;

    private String phdSupervisorName;
    private String phdSupervisorEmail;
    private boolean phdSupervisorChanged;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "committee_id")  // Foreign key in committee_members table
    private List<CommitteeMember> members;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getDcChairName() {
        return dcChairName;
    }

    public void setDcChairName(String dcChairName) {
        this.dcChairName = dcChairName;
    }

    public String getDcChairEmail() {
        return dcChairEmail;
    }

    public void setDcChairEmail(String dcChairEmail) {
        this.dcChairEmail = dcChairEmail;
    }

    public boolean isDcChairChanged() {
        return dcChairChanged;
    }

    public void setDcChairChanged(boolean dcChairChanged) {
        this.dcChairChanged = dcChairChanged;
    }

    public String getPhdSupervisorName() {
        return phdSupervisorName;
    }

    public void setPhdSupervisorName(String phdSupervisorName) {
        this.phdSupervisorName = phdSupervisorName;
    }

    public String getPhdSupervisorEmail() {
        return phdSupervisorEmail;
    }

    public void setPhdSupervisorEmail(String phdSupervisorEmail) {
        this.phdSupervisorEmail = phdSupervisorEmail;
    }

    public boolean isPhdSupervisorChanged() {
        return phdSupervisorChanged;
    }

    public void setPhdSupervisorChanged(boolean phdSupervisorChanged) {
        this.phdSupervisorChanged = phdSupervisorChanged;
    }

    public List<CommitteeMember> getMembers() {
        return members;
    }

    public void setMembers(List<CommitteeMember> members) {
        this.members = members;
    }
}
