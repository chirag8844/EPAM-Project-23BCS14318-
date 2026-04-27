package com.ecommerce.ecommerce_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.ecommerce.ecommerce_platform.entity.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);
}
