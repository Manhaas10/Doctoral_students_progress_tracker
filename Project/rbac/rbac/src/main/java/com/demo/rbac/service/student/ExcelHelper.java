package com.demo.rbac.service.student;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.demo.rbac.model.Student;
//import com.demo.rbac.model.AdmissionScheme;
import com.demo.rbac.model.Guide;
import com.demo.rbac.repository.GuideRepository;

import java.io.*;
import java.util.*;

@Service // Marks as Spring-managed service
public class ExcelHelper {

    private static final List<String> ACCEPTED_TYPES = Arrays.asList(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
            "application/vnd.ms-excel" // XLS
    );

    public ExcelHelper(GuideRepository guideRepository) {
    }

    public static boolean hasExcelFormat(MultipartFile file) {
        return ACCEPTED_TYPES.contains(file.getContentType());
    }

    public List<Student> excelToStudents(InputStream inputStream) {
        List<Student> students = new ArrayList<>();
        DataFormatter formatter = new DataFormatter(); // Handles different data types

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            boolean firstRow = true;

            while (rows.hasNext()) {
                Row row = rows.next();
                if (firstRow) { // Skip header row
                    firstRow = false;
                    continue;
                }

                String studentRoll = formatter.formatCellValue(row.getCell(0)).trim();
                String studentName = formatter.formatCellValue(row.getCell(1)).trim();
                String guideName = formatter.formatCellValue(row.getCell(4)).trim();
                String studentEmail = formatter.formatCellValue(row.getCell(2)).trim();
                String guideEmail = formatter.formatCellValue(row.getCell(5)).trim();
                String admissionSchemeStr = formatter.formatCellValue(row.getCell(3)).trim().toUpperCase();
                String dateofjoin = formatter.formatCellValue(row.getCell(6)).trim();


                // Create Student object (Guide lookup happens in StudentService)
                Student student = new Student();
                student.setRoll(studentRoll);
                student.setName(studentName);
                student.setGuide(new Guide(guideName, guideEmail)); // Just assigning temporarily
                student.setEmail(studentEmail);
                student.setAdmissionscheme(admissionSchemeStr); // Set admission scheme
                student.setOrcid(null);  // ORCID will be updated later
                student.setAreaofresearch(null); // Area of research will be updated later
                student.setDateofjoin(dateofjoin); // Area of research will be updated later

                students.add(student);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error processing Excel file: " + e.getMessage());
        }

        return students; // Return students, do NOT save here
    }
}
