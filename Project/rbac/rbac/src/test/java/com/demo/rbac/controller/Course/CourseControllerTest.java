package com.demo.rbac.controller.Course;

import com.demo.rbac.model.Course;
import com.demo.rbac.service.Course.CourseService;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.mockito.Mock;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.mockito.MockitoAnnotations;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CourseController.class)
class CourseControllerTest {


    @Mock
    private CourseService courseService;        
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }
       

    private static final String COURSE_UPLOAD_URL = "/api/courses/upload";
    private static final String COURSE_ALL_URL = "/api/courses/all";

    private Course createSampleCourse() {
        Course course = new Course();
        course.setId("P202300CS");
        course.setCourse_name("Intro to CS");
        return course;
    }

    @Test
    void testUploadFile_Success() throws Exception {
        Course sampleCourse = createSampleCourse();
        List<Course> courseList = List.of(sampleCourse);

        when(courseService.saveCoursesFromExcel(any())).thenReturn(courseList);

        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "courses.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "fake-excel-data".getBytes()
        );

        mockMvc.perform(multipart(COURSE_UPLOAD_URL).file(mockFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("P202300CS"))
                .andExpect(jsonPath("$[0].course_name").value("Intro to CS"));
    }

    @Test
    void testUploadFile_EmptyFile() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                new byte[0]
        );

        mockMvc.perform(multipart(COURSE_UPLOAD_URL).file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("File is empty. Please upload a valid Excel file."));
    }

    @Test
    void testUploadFile_Exception() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "courses.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "fake-excel-data".getBytes()
        );

        when(courseService.saveCoursesFromExcel(any()))
                .thenThrow(new RuntimeException("Excel parse error"));

        mockMvc.perform(multipart(COURSE_UPLOAD_URL).file(mockFile))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error processing file: Excel parse error"));
    }

    @Test
    void testGetAllCourses_Success() throws Exception {
        Course course = createSampleCourse();
        List<Course> courseList = List.of(course);

        when(courseService.getAllCourses()).thenReturn(courseList);

        mockMvc.perform(get(COURSE_ALL_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("P202300CS"))
                .andExpect(jsonPath("$[0].course_name").value("Intro to CS"));
    }

    @Test
    void testGetAllCourses_EmptyList() throws Exception {
        when(courseService.getAllCourses()).thenReturn(Collections.emptyList());

        mockMvc.perform(get(COURSE_ALL_URL))
                .andExpect(status().isOk())
                .andExpect(content().string("No courses available."));
    }

    @Test
    void testGetAllCourses_Exception() throws Exception {
        when(courseService.getAllCourses()).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get(COURSE_ALL_URL))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error retrieving courses: Database error"));
    }
}
