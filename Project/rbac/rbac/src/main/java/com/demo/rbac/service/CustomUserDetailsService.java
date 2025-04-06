package com.demo.rbac.service;

import com.demo.rbac.repository.CoordinatorRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final CoordinatorRepository coordinatorRepository;

    public CustomUserDetailsService(CoordinatorRepository coordinatorRepository) {
        this.coordinatorRepository = coordinatorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return coordinatorRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Coordinator not found"));
    }
}
