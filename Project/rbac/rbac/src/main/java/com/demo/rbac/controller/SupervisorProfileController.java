package com.demo.rbac.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class SupervisorProfileController {

    @GetMapping("/super")
    public Map<String, String> getSupervisorProfile(@AuthenticationPrincipal OAuth2User oAuth2User) {
        if (oAuth2User == null) {
            throw new RuntimeException("User not authenticated");
        }

        // Extracting user information from OAuth2User
        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        // Preparing the response as a JSON object
        Map<String, String> response = new HashMap<>();
        response.put("name", name);
        response.put("email", email);

        return response;
    }

}
