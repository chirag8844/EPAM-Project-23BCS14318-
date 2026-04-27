package com.ecommerce.ecommerce_platform.service;

import java.util.Optional;

import com.ecommerce.ecommerce_platform.dto.AuthResponse;
import com.ecommerce.ecommerce_platform.entity.Role;
import com.ecommerce.ecommerce_platform.entity.User;
import com.ecommerce.ecommerce_platform.repository.UserRepository;
import com.ecommerce.ecommerce_platform.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse register(User user) {
        if (user.getPassword() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password required");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) user.setRole(Role.CUSTOMER);
        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name());
        return new AuthResponse(token, saved);
    }

    public AuthResponse registerVendor(User user) {
        user.setRole(Role.VENDOR);
        return register(user);
    }

    public AuthResponse login(String email, String password) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        User user = opt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user);
    }
}
