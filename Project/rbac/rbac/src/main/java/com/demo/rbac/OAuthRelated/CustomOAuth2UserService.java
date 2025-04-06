package com.demo.rbac.OAuthRelated;

import com.demo.rbac.model.Guide;
import com.demo.rbac.model.Student;
import com.demo.rbac.model.User;
import com.demo.rbac.model.UserRole;
import com.demo.rbac.repository.GuideRepository;
import com.demo.rbac.repository.StudentRepository;
import com.demo.rbac.service.student.StudentService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final StudentRepository studentRepository;
    private final GuideRepository guideRepository;

    private static final Pattern STUDENT_EMAIL_PATTERN =
            Pattern.compile("^[a-z]+_b\\d{6}[a-z]{2}@nitc\\.ac\\.in$");
    private static final Pattern SUPERVISOR_EMAIL_PATTERN =
            Pattern.compile("^[a-z0-9]+@gmail\\.com$");

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new OAuth2AuthenticationException("Email is required");
        }

        UserRole role = determineUserRole(email);
        if (role == UserRole.STUDENT) {
            Optional<Student> userOptional = studentRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                Student user = userOptional.get();
                user.setUserRole(role);
                System.out.println(user.getUserRole());
                if (user.getUserRole() != role) {
                    throw new OAuth2AuthenticationException("Role mismatch for user");
                }
                return new CustomUserDetails(user, oAuth2User.getAttributes());
            } else {
                throw new OAuth2AuthenticationException("Student not registered");
            }
        }
        else if (role == UserRole.SUPERVISOR) {
            Optional<Guide> optionalGuide = guideRepository.findByEmail(email);
            if (optionalGuide.isPresent()) {
                Guide supervisor = optionalGuide.get();
                supervisor.setUserRole(role);
                System.out.println("customoauth2userservice " + supervisor.getUserRole());
                if (supervisor.getUserRole() != role) {
                    throw new OAuth2AuthenticationException("Role mismatch for user");
                }
                System.out.println("success");
                return new CustomUserDetails(supervisor, oAuth2User.getAttributes());
            } else {
                throw new OAuth2AuthenticationException("Supervisor not registered");
            }
        }

        // This will never be reached due to determineUserRole() validation
        throw new IllegalStateException("Unexpected role type");
    }


    private UserRole determineUserRole(String email) {
        if (STUDENT_EMAIL_PATTERN.matcher(email).matches()) {
            return UserRole.STUDENT;
        } else if (SUPERVISOR_EMAIL_PATTERN.matcher(email).matches()) {
            return UserRole.SUPERVISOR;
        }
        throw new OAuth2AuthenticationException("Invalid email domain");
    }
}
