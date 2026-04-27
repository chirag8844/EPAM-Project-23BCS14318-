package com.ecommerce.ecommerce_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.ecommerce_platform.entity.Role;
import com.ecommerce.ecommerce_platform.entity.User;
import com.ecommerce.ecommerce_platform.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User registerVendor(User user) {
        user.setRole(Role.VENDOR);
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String password) {
        return userRepository.findByEmail(email)
            .filter(u -> u.getPassword() != null && new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().matches(password, u.getPassword()));
    }

    public User updateProfile(Long id, User details) {
        return userRepository.findById(id).map(user -> {
            user.setName(details.getName());
            user.setPhoneNumber(details.getPhoneNumber());
            user.setAge(details.getAge());
            user.setAddress(details.getAddress());
            // Email is usually not updated here for security reasons, 
            // but if needed it can be added.
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
