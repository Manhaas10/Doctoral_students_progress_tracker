package com.demo.rbac.controller;

import com.demo.rbac.OAuthRelated.CustomUserDetails;
import com.demo.rbac.model.User;
import com.demo.rbac.model.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api")
public class DashboardController {

    @GetMapping("/dashboard")
    public ResponseEntity<Void> dashboard(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        User user = userDetails.getUser();
        model.addAttribute("user", user);

        // Redirect based on role
        URI redirectUri = switch (user.getUserRole()) {
            case COORDINATOR -> URI.create("redirect:/coordinator-dashboard");
            case SUPERVISOR -> URI.create("redirect:/supervisor-dashboard");
            // For student, redirect to React frontend (index.jsx)
            // i am being sent here on http://localhost:8080/api/dashboard
            case STUDENT -> URI.create("http://localhost:5173/student-dashboard");
            default -> URI.create("redirect:/");
        };

        return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
    }

    @GetMapping("/coordinator-dashboard")
    public String coordinatorDashboard() {
        return "coordinator-dashboard-enter";
    }

    @GetMapping("/supervisor-dashboard")
    public String supervisorDashboard() {
        return "supervisor-dashboard-enter";
    }

    // New endpoint to provide student dashboard data as JSON for the React frontend
    @GetMapping("/student-dashboard")
    @ResponseBody
    public ResponseEntity<?> studentDashboardData(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userDetails.getUser();
        if (user.getUserRole() != UserRole.STUDENT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Prepare student-specific dashboard data
        Map<String, Object> data = new HashMap<>();
        // Additional student details can be added below

        // Example dummy data for upcoming meetings and recent publications:
        data.put("upcomingMeetings", List.of(
                Map.of("id", 1, "title", "DC Committee Meeting", "date", "Nov 15, 2024", "status", "scheduled"),
                Map.of("id", 2, "title", "Progress Review", "date", "Dec 05, 2024", "status", "pending")
        ));
        data.put("recentPublications", List.of(
                Map.of("id", 1, "title", "Machine Learning in Healthcare: A Systematic Review", "journal", "IEEE Transactions on Medical Imaging", "status", "published", "date", "Oct 10, 2024"),
                Map.of("id", 2, "title", "Deep Learning for Natural Language Processing", "journal", "Journal of Artificial Intelligence Research", "status", "under review", "date", "Aug 15, 2024")
        ));

        return ResponseEntity.ok(data);
    }

}
