package com.demo.rbac.service;

import com.demo.rbac.model.Coordinator;
import com.demo.rbac.model.UserRole;
import com.demo.rbac.repository.CoordinatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class CoordinatorService {
    private final CoordinatorRepository coordinatorRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String COORDINATOR_USERNAME = "coordinator";
    private static final String COORDINATOR_PASSWORD = "securepassword"; // In production, use environment variables

    @PostConstruct
    public void initializeCoordinator() {
        if (coordinatorRepository.count() == 0) {
            Coordinator coordinator = new Coordinator();
            coordinator.setUsername(COORDINATOR_USERNAME);
            coordinator.setPassword(passwordEncoder.encode(COORDINATOR_PASSWORD));
            coordinator.setUserRole(UserRole.COORDINATOR);

            coordinatorRepository.save(coordinator);

            System.out.println("Coordinator initialized with username: " + COORDINATOR_USERNAME);
            System.out.println("WARNING: Change default credentials in production!");
        }
    }

}
