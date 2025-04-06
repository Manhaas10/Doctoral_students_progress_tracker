package com.demo.rbac.controller;

import com.demo.rbac.model.Coordinator;
import com.demo.rbac.repository.CoordinatorRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class CoordinatorLoginController {
    // for coordinator login
    private final AuthenticationManager authenticationManager;
    private final CoordinatorRepository coordinatorRepository;
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        System.out.println("am i entering here");
        // Set authentication in security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Find user in database
        Optional<Coordinator> coordinator = coordinatorRepository.findByUsername(request.username());
        if (coordinator.isPresent()) {
            return ResponseEntity.ok(new LoginResponse("Login successful!", coordinator.get().getUserRole().name()));
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
    @GetMapping("/oauth2/authorization/google")
public void initiateGoogleOAuth(HttpServletRequest request, HttpServletResponse response, 
                                @RequestParam(required = false) String role) throws IOException {
    if (role != null) {
        request.getSession().setAttribute("requestedRole", role);
    }
    response.sendRedirect("/oauth2/authorization/google"); // Continue OAuth flow
}
    
}

// DTO for Login Request
record LoginRequest(String username, String password) {}

// DTO for Login Response
record LoginResponse(String message, String role) {}
