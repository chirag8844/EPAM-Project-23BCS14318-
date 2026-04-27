package com.ecommerce.ecommerce_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.ecommerce_platform.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartIdOrderByIdAsc(Long cartId);
    long countByCartUserId(Long userId);
}
