package com.ecommerce.ecommerce_platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

import com.ecommerce.ecommerce_platform.dto.AuthResponse;
import com.ecommerce.ecommerce_platform.entity.User;
import com.ecommerce.ecommerce_platform.service.AuthService;
import com.ecommerce.ecommerce_platform.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public AuthResponse createUser(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/register/vendor")
    public AuthResponse registerVendor(@RequestBody User user) {
        return authService.registerVendor(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        return authService.login(email, password);
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/profile")
    public User updateProfile(@RequestBody User user, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authUserId");
        return userService.updateProfile(userId, user);
    }
}