package com.ecommerce.ecommerce_platform.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.ecommerce_platform.dto.AuthResponse;
import com.ecommerce.ecommerce_platform.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        return authService.login(email, password);
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        // Stateless JWT: backend does not track sessions by default.
        // Expose a simple endpoint so frontend can call it and clear client-side tokens.
        return Map.of("status", "ok");
    }
}
