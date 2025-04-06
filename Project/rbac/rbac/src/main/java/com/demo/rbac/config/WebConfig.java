package com.demo.rbac.config;

// this class is used to manage frontEnd REACT and backend SpringBoot Collectively


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    // 5173 is react frontend port number
    @Override
    public void addCorsMappings(CorsRegistry registry){
        registry.addMapping("/api/**") // allow all API endpoints
                .allowedOrigins("http://localhost:5173") // React frontend
                .allowedMethods("GET","POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
