package com.demo.rbac.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ErrorController {
    @GetMapping("/error-page")
    public String errorPage() {
        return "error"; // This should map to `error.html` in `src/main/resources/templates/`
    }
}
