package com.demo.rbac.service.Results;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import com.demo.rbac.model.Results;

import java.io.*;
import java.util.*;

public class Resultshelper {

    private static final List<String> ACCEPTED_TYPES = Arrays.asList(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
        "application/vnd.ms-excel" // XLS
    );

    public static boolean hasExcelFormat(MultipartFile file) {
        return ACCEPTED_TYPES.contains(file.getContentType());
    }

    public static List<Results> excelToResultss(InputStream inputStream) {
        List<Results> resultsList = new ArrayList<>();
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
    
                Results result = new Results();
                result.setName(formatter.formatCellValue(row.getCell(1)));  // Name
                result.setId(formatter.formatCellValue(row.getCell(0))); // Roll No
                result.setCore(Integer.parseInt(formatter.formatCellValue(row.getCell(2)))); // Core (num)
                result.setSpecialization(Integer.parseInt(formatter.formatCellValue(row.getCell(3)))); // Specialization (num)
    
                resultsList.add(result);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error processing Excel file: " + e.getMessage());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid number format in Excel file: " + e.getMessage());
        }
    
        return resultsList;
    }
}
