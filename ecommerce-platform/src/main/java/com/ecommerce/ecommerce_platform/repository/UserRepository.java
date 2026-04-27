package com.ecommerce.ecommerce_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.ecommerce.ecommerce_platform.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);
}
