package com.demo.rbac.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SupervisorProfileController.class)
class SupervisorProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetSupervisorProfile_Success() throws Exception {
        Map<String, Object> attributes = Map.of(
                "name", "John Doe",
                "email", "john@example.com"
        );

        OAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(() -> "ROLE_USER"),  // authorities
                attributes,
                "email"  // key used for getName()
        );

        OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "google" // registrationId
        );

        mockMvc.perform(get("/api/user/super")
                        .with(authentication(authentication)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void testGetSupervisorProfile_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/user/super"))
               .andExpect(status().isUnauthorized());
    }
}
