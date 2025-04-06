package com.demo.rbac.config;

import com.demo.rbac.model.Guide;
import com.demo.rbac.model.Student;
import com.demo.rbac.repository.GuideRepository;
import com.demo.rbac.repository.StudentRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import com.demo.rbac.model.UserRole;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Optional;

@Configuration
public class SecurityConfig {

    private final OAuth2UserService customOAuth2UserService;
    private final AuthenticationFailureHandler customAuthenticationFailureHandler;
    private final StudentRepository studentRepository;
    private final GuideRepository guideRepository;

    public SecurityConfig(@Lazy OAuth2UserService customOAuth2UserService,
                          AuthenticationFailureHandler customAuthenticationFailureHandler,
                          StudentRepository studentRepository, GuideRepository guideRepository) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.customAuthenticationFailureHandler = customAuthenticationFailureHandler;
        this.studentRepository = studentRepository;
        this.guideRepository = guideRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // Keep normal session management
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/login**", "/error**", "/api/auth/**", "/oauth2/**").permitAll()
                        .requestMatchers("/api/coordinator/**").hasRole("COORDINATOR")
                        .requestMatchers("/api/supervisor/**").hasRole("SUPERVISOR")
                        .requestMatchers("/api/student/**").hasRole("STUDENT")
                        .requestMatchers("api/user/profile").permitAll()
                        .requestMatchers("api/user/super").permitAll()
                        .requestMatchers("/api/students/upload").permitAll()
                        .requestMatchers("/api/students/all").permitAll()
                        .requestMatchers("api/students/**").permitAll()
                        .requestMatchers("/api/dc-meetings/**").permitAll()
                        .requestMatchers("/api/students/").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/api/user/update-profile").permitAll()
                        .requestMatchers("/api/courses/all").permitAll()
                        .requestMatchers("/api/exams/**").permitAll()
                        .requestMatchers("/api/applications/**").permitAll()
                        .requestMatchers("/api/courses/upload").permitAll()
                        // .requestMatchers("/api/courses/get").permitAll()
                        .requestMatchers("/api/results/upload").permitAll()
                        .requestMatchers("/api/results/all").permitAll()
                        .requestMatchers("/api/publications/get").permitAll()
                        .requestMatchers("/api/publications/**").permitAll()
                        .requestMatchers("/api/guides/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/coursereq/**").permitAll()
                        
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler((request, response, authentication) -> {
                            try {
                                handleOAuth2Success(request, response, authentication);
                            } catch (Exception e) {

                                e.printStackTrace();
                            }
                        })
                        .failureHandler(customAuthenticationFailureHandler)
                )
                .logout(logout -> logout.logoutSuccessUrl("/"))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
                );

        return http.build();
    }

    private void handleOAuth2Success(HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.Authentication authentication) throws Exception {
        // Get logged-in user email
        String userEmail = authentication.getName();

        // Retrieve requested role from cookies instead of session
        String requestedRoleStr = getCookieValue(request, "requestedRole");

        System.out.println("Requested Role from Cookie: " + requestedRoleStr);

        if (requestedRoleStr == null) {
            response.sendRedirect("http://localhost:5173/login?error=role_missing");
            return;
        }

        // Convert requested role string to enum safely
        UserRole requestedRole;
        try {
            requestedRole = UserRole.valueOf(requestedRoleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            response.sendRedirect("http://localhost:5173/login?error=invalid_requested_role");
            return;
        }

        UserRole actualRole = null;

        if (requestedRole == UserRole.STUDENT) {
            Optional<Student> optionalStudent = studentRepository.findByEmail(userEmail);
            if (optionalStudent.isEmpty()) {
                response.sendRedirect("http://localhost:5173/login?error=user_not_found");
                return;
            }
            Student student = optionalStudent.get();
            actualRole = student.getUserRole();
        }
        else if (requestedRole == UserRole.SUPERVISOR) {
            Optional<Guide> optionalGuide = guideRepository.findByEmail(userEmail);
            if (optionalGuide.isEmpty()) {
                response.sendRedirect("http://localhost:5173/login?error=user_not_found");
                return;
            }
            Guide guide = optionalGuide.get();
            actualRole = guide.getUserRole();
        }

        System.out.println("Requested Role: " + requestedRoleStr);
        System.out.println("Actual Role: " + actualRole);

        // Role mismatch check
        if (actualRole == null || !actualRole.equals(requestedRole)) {
            response.sendRedirect("http://localhost:5173/login?error=role_mismatch");
            return;
        }

        // Redirect based on actual role
        switch (actualRole) {
            case STUDENT:
                response.sendRedirect("http://localhost:5173/student-dashboard");
                break;
            case SUPERVISOR:
                response.sendRedirect("http://localhost:5173/index2");
                break;
            case COORDINATOR:
                response.sendRedirect("http://localhost:5173/dashboardc");
                break;
            default:
                response.sendRedirect("http://localhost:5173/login?error=invalid_role");
        }
    }


    // Utility Method: Get cookie value by name
    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (name.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return new Http403ForbiddenEntryPoint();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(List.of(authProvider));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
