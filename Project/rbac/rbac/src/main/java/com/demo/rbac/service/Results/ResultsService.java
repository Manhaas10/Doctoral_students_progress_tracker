package com.demo.rbac.service.Results;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.demo.rbac.model.Results;
import com.demo.rbac.repository.ResultsRepository;
import java.util.List;
import java.util.Optional;

@Service
public class ResultsService {

    @Autowired
    private ResultsRepository ResultsRepository; // ✅ Corrected variable naming convention

    public List<Results> saveResultssFromExcel(MultipartFile file) {
        try {
            if (!Resultshelper.hasExcelFormat(file)) {
                throw new IllegalArgumentException("Invalid Excel file format.");
            }
    
            List<Results> Resultss = Resultshelper.excelToResultss(file.getInputStream());

            if (Resultss.isEmpty()) {
                throw new RuntimeException("No valid Resultss found in the uploaded file.");
            }

            return ResultsRepository.saveAll(Resultss);  // ✅ Save and return the list
        } catch (Exception e) {
            throw new RuntimeException("Error processing Excel file: " + e.getMessage(), e);
        }
    }

    public List<Results> getAllResultss() {
        List<Results> Resultss = ResultsRepository.findAll();
        if (Resultss.isEmpty()) {
            throw new RuntimeException("No Resultss found in the database.");
        }
        return Resultss;
    }
    public Optional<Results> getResultsByRollNo(String rollNo) {
        return ResultsRepository.findById(rollNo);
    }
}
