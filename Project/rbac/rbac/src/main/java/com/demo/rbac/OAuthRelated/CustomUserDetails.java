package com.demo.rbac.OAuthRelated;

import com.demo.rbac.model.Guide;
import com.demo.rbac.model.Student;
import com.demo.rbac.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;


public class CustomUserDetails implements UserDetails, OAuth2User {

    private Student student;
    private Map<String, Object> attributes;
    private Guide guide;

    public CustomUserDetails(Guide guide, Map<String, Object> attributes) {
        this.attributes = attributes;
        this.guide = guide;
    }

    public CustomUserDetails(Student student, Map<String, Object> attributes) {
        this.student = student;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
//        System.out.println("are we entering here");
        // these authorities are used by UserService
        if (student != null) {
            System.out.println(student.getUserRole().name());
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + student.getUserRole().name()));
        }
        if (guide != null) {
            System.out.println(guide.getUserRole().name());
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + guide.getUserRole().name()));
        }
        throw new IllegalStateException("UserDetails not properly initialized");
    }

    @Override
    public String getPassword() {
        return null; //OAuth2 doesn't use password
    }

    @Override
    public String getUsername() {
        if (student != null) {
            return student.getEmail();
        }
        if (guide != null) {
            return guide.getEmail();
        }
        throw new IllegalStateException("UserDetails not properly initialized");
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public String getName(){
        if (student != null) {
            return student.getEmail();
        }
        if (guide != null) {
            return guide.getEmail();
        }
        throw new IllegalStateException("UserDetails not properly initialized");
    }

    public UserDetails withAttributes(Map<String, Object> attributes){
        if (this.student != null) {
            return new CustomUserDetails(this.student, attributes);
        }
        else if (this.guide != null) {
            return new CustomUserDetails(this.guide, attributes);
        }
        throw new IllegalStateException("No user entity available");
    }

    public User getUser() {
        if (student != null) {
            return student;
        }
        if (guide != null) {
            return guide;
        }
        throw new IllegalStateException("UserDetails not properly initialized");

    }
}
