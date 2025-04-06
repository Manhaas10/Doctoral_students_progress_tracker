package com.demo.rbac.controller;

import com.demo.rbac.controller.Results.ResultsController;
import com.demo.rbac.model.Results;
import com.demo.rbac.service.Results.ResultsService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResultsControllerTest {

    @Mock
    private ResultsService resultsService;

    @InjectMocks
    private ResultsController resultsController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ---------- Upload File Tests ----------

    @Test
    void uploadFile_validFile_returnsSavedResults() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "results.xlsx", "application/vnd.ms-excel", "dummy data".getBytes());
        List<Results> mockResultsList = List.of(new Results("P202300CS", "Alice", 85, 90), new Results("P202300ME", "Bob", 88, 87));

        when(resultsService.saveResultssFromExcel(file)).thenReturn(mockResultsList);

        ResponseEntity<?> response = resultsController.uploadFile(file);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockResultsList, response.getBody());
    }

    @Test
    void uploadFile_emptyFile_returnsBadRequest() {
        MultipartFile emptyFile = new MockMultipartFile("file", "results.xlsx", "application/vnd.ms-excel", new byte[0]);

        ResponseEntity<?> response = resultsController.uploadFile(emptyFile);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("File is empty. Please upload a valid Excel file.", response.getBody());
    }

    @Test
    void uploadFile_nullFile_returnsBadRequest() {
        ResponseEntity<?> response = resultsController.uploadFile(null);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("File is empty. Please upload a valid Excel file.", response.getBody());
    }

    @Test
    void uploadFile_exceptionThrown_returnsServerError() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "results.xlsx", "application/vnd.ms-excel", "dummy data".getBytes());

        when(resultsService.saveResultssFromExcel(file)).thenThrow(new RuntimeException("Excel parsing failed"));

        ResponseEntity<?> response = resultsController.uploadFile(file);

        assertEquals(500, response.getStatusCode().value());
        assertTrue(response.getBody().toString().contains("Error while processing file"));
    }

    // ---------- Get All Results Tests ----------

    @Test
    void getAllResultss_withData_returnsResultsList() {
        List<Results> mockResultsList = List.of(new Results("P202300CS", "Alice", 85, 90));
        when(resultsService.getAllResultss()).thenReturn(mockResultsList);

        ResponseEntity<?> response = resultsController.getAllResultss();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockResultsList, response.getBody());
    }

    @Test
    void getAllResultss_noData_returnsMessage() {
        when(resultsService.getAllResultss()).thenReturn(Collections.emptyList());

        ResponseEntity<?> response = resultsController.getAllResultss();

        assertEquals(200, response.getStatusCode().value());
        assertEquals("No Resultss available.", response.getBody());
    }

    // ---------- Get Results by Roll Number Tests ----------

    @Test
    void getResultsByRollNo_found_returnsResult() {
        Results result = new Results("B123456", "John Doe", 80, 90);
        when(resultsService.getResultsByRollNo("B123456")).thenReturn(Optional.of(result));

        ResponseEntity<?> response = resultsController.getResultsByRollNo("B123456");

        assertEquals(200, response.getStatusCode().value());
        assertEquals(result, response.getBody());
    }

    @Test
    void getResultsByRollNo_notFound_returns404() {
        when(resultsService.getResultsByRollNo("B000000")).thenReturn(Optional.empty());

        ResponseEntity<?> response = resultsController.getResultsByRollNo("B000000");

        assertEquals(404, response.getStatusCode().value());
        assertTrue(response.getBody().toString().contains("No results found for roll number"));
    }

    @Test
    void getResultsByRollNo_nullRollNo_returns404() {
        ResponseEntity<?> response = resultsController.getResultsByRollNo(null);

        assertEquals(404, response.getStatusCode().value());
        assertTrue(response.getBody().toString().contains("No results found for roll number"));
    }

    @Test
    void getResultsByRollNo_emptyRollNo_returns404() {
        ResponseEntity<?> response = resultsController.getResultsByRollNo("");

        assertEquals(404, response.getStatusCode().value());
        assertTrue(response.getBody().toString().contains("No results found for roll number"));
    }

    @Test
    void getResultsByRollNo_exception_returns500() {
        when(resultsService.getResultsByRollNo("B123456")).thenThrow(new RuntimeException("DB failure"));

        ResponseEntity<?> response = resultsController.getResultsByRollNo("B123456");

        assertEquals(500, response.getStatusCode().value());
        assertTrue(response.getBody().toString().contains("Error retrieving results"));
    }
}
