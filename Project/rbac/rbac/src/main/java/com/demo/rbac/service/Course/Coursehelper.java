package com.demo.rbac.service.Course;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import com.demo.rbac.model.Course;

import java.io.*;
import java.util.*;

public class Coursehelper {

    private static final List<String> ACCEPTED_TYPES = Arrays.asList(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
        "application/vnd.ms-excel" // XLS
    );

    public static boolean hasExcelFormat(MultipartFile file) {
        return ACCEPTED_TYPES.contains(file.getContentType());
    }

    public static List<Course> excelToCourses(InputStream inputStream) {
        List<Course> courses = new ArrayList<>();
        DataFormatter formatter = new DataFormatter(); // ✅ Handles different data types safely

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0); // ✅ Read first sheet
            Iterator<Row> rows = sheet.iterator();
            boolean firstRow = true;

            while (rows.hasNext()) {
                Row row = rows.next();
                if (firstRow) { // ✅ Skip header row
                    firstRow = false;
                    continue;
                }

                // ✅ Read Department column (Index 1)
                String department = formatter.formatCellValue(row.getCell(1)).trim();

                // ✅ Only process rows where the department is "Computer Science and Engineering"
                if ("Computer Science and Engineering".equalsIgnoreCase(department)) {
                    Course course = new Course();
                    
                    course.setId(formatter.formatCellValue(row.getCell(0)).trim()); // Course ID
                    course.setDept(department); // ✅ Store "Computer Science and Engineering"
                    course.setCourse_name(formatter.formatCellValue(row.getCell(2)).trim()); // Course Name
                    course.setSME_Name(formatter.formatCellValue(row.getCell(3)).trim()); // SME Name
                    course.setInstitute(formatter.formatCellValue(row.getCell(4)).trim()); // Institute
                    course.setCo_Institute(formatter.formatCellValue(row.getCell(5)).trim()); // Co-Institute
                    course.setDuration(formatter.formatCellValue(row.getCell(6)).trim()); // Duration
                    course.setTypeofCourse(formatter.formatCellValue(row.getCell(7)).trim()); // Course Type
                    course.setStartDate(formatter.formatCellValue(row.getCell(8)).trim()); // Start Date
                    course.setEndDate(formatter.formatCellValue(row.getCell(9)).trim()); // End Date
                    course.setExamDate(formatter.formatCellValue(row.getCell(10)).trim()); // Exam Date

                    courses.add(course);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error processing Excel file: " + e.getMessage());
        }

        return courses;
    }
}
