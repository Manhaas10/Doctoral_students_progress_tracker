package com.demo.rbac.controller;

import com.demo.rbac.model.Coordinator;
import com.demo.rbac.model.UserRole;
import com.demo.rbac.repository.CoordinatorRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(CoordinatorLoginController.class)
class CoordinatorLoginControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private CoordinatorRepository coordinatorRepository;

    @Test
    void testLogin_Success() throws Exception {
        // Mock authentication
        Authentication authentication = new UsernamePasswordAuthenticationToken("coordinator", "password");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);

        // Mock coordinator lookup
        Coordinator coordinator = new Coordinator();
        coordinator.setUsername("coordinator");
        coordinator.setUserRole(UserRole.COORDINATOR); // Make sure this enum exists

        when(coordinatorRepository.findByUsername("coordinator")).thenReturn(Optional.of(coordinator));

        // Perform POST request
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "username": "coordinator",
                                "password": "password"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful!"))
                .andExpect(jsonPath("$.role").value("COORDINATOR"));
    }

    @Test
    void testLogin_InvalidCredentials() throws Exception {
        // Mock successful authentication but no coordinator found in DB
        Authentication authentication = new UsernamePasswordAuthenticationToken("invalid", "password");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(coordinatorRepository.findByUsername("invalid")).thenReturn(Optional.empty());

        // Perform POST request
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "username": "invalid",
                                "password": "password"
                            }
                        """))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid credentials"));
    }

    @Test
    void testGoogleOAuthRedirect_WithRole() throws Exception {
        mockMvc.perform(get("/api/auth/oauth2/authorization/google")
                        .param("role", "student"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/oauth2/authorization/google"));
    }

    @Test
    void testGoogleOAuthRedirect_WithoutRole() throws Exception {
        mockMvc.perform(get("/api/auth/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/oauth2/authorization/google"));
    }
}
