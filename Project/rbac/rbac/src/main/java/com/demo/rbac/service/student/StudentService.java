package com.demo.rbac.service.student;

import com.demo.rbac.dto.StudentGuideDTO;

import com.demo.rbac.dto.StudentUnderGuideDTO;
import com.demo.rbac.model.Student;
import com.demo.rbac.model.Guide;
import com.demo.rbac.repository.StudentRepository;
import com.demo.rbac.repository.GuideRepository;
import com.demo.rbac.repository.PublicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GuideRepository guideRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired
    private ExcelHelper excelHelper; 

    /**
     * Uploads student data from an Excel file and associates them with guides if available.
     */
    public List<Student> saveStudentsFromExcel(MultipartFile file) {
        try {
            if (!ExcelHelper.hasExcelFormat(file)) {
                throw new IllegalArgumentException("Invalid Excel file format.");
            }

            InputStream inputStream = file.getInputStream();
            List<Student> students = excelHelper.excelToStudents(inputStream);

            for (Student student : students) {
                if (student.getGuide() != null && student.getGuide().getEmail() != null) {
                    Optional<Guide> existingGuideOpt = guideRepository.findByEmail(student.getGuide().getEmail());

                    Guide guide = existingGuideOpt.orElseGet(() -> {
                        Guide newGuide = new Guide();
                        newGuide.setName(student.getGuide().getName());
                        newGuide.setEmail(student.getGuide().getEmail());
                        return guideRepository.save(newGuide);
                    });

                    // Update guide name only if it has changed
                    if (existingGuideOpt.isPresent() && student.getGuide().getName() != null &&
                        !student.getGuide().getName().equals(guide.getName())) {
                        guide.setName(student.getGuide().getName());
                        guideRepository.save(guide);
                    }

                    student.setGuide(guide);
                }
            }

            return studentRepository.saveAll(students);
        } catch (Exception e) {
            throw new RuntimeException("Error saving students: " + e.getMessage(), e);
        }
    }

    /**
     * Fetches all students.
     */
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * Fetches all students along with their assigned guides.
     */
    public List<StudentGuideDTO> getAllStudentsWithGuides() {
        return studentRepository.findAllWithGuides();
    }

    /**
     * Fetches student by email.
     */
    public Optional<Student> findByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    /**
     * Saves or updates a student.
     */
    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    /**
     * Fetches student by roll number.
     */
    public Optional<Student> getStudentByRollNumber(String rollNumber) {
        return studentRepository.findById(rollNumber);
    }

    /**
     * Updates student details.
     */
    public Student updateStudent(Student student) {
        return studentRepository.save(student);
    }

    /**
     * Retrieves a list of students along with their publication count under a specific guide.
     */
    public List<StudentUnderGuideDTO> getStudentsUnderGuide(Long guideId) {
        return studentRepository.findStudentsByGuideWithPublicationCount(guideId)
                .stream()
                .map(obj -> new StudentUnderGuideDTO(
                        (String) obj[0],  // Roll Number
                        (String) obj[1],  // Name
                        (String) obj[2],  // ORCID
                        ((Number) obj[3]).intValue() // Publication Count
                ))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves publication count for a specific student by roll number.
     */
    public int getPublicationCountForStudent(String rollNo) {
        return publicationRepository.countByRollNo(rollNo);
    }

    public Student getAuthenticatedStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // Typically, the email is set as the principal's username.
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated student not found for email: " + email));
    }
}
