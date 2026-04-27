package com.ecommerce.ecommerce_platform.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.ecommerce_platform.entity.Cart;
import com.ecommerce.ecommerce_platform.service.CartService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public Cart addToCart(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        if (authId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        Long productId = ((Number) body.getOrDefault("productId", 0)).longValue();
        int qty = ((Number) body.getOrDefault("quantity", 1)).intValue();
        return cartService.addToCart(authId, productId, qty);
    }

    @GetMapping
    public Cart getCart(HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        if (authId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        return cartService.getOrCreateCart(authId);
    }

    @GetMapping("/count")
    public Map<String, Integer> count(HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        if (authId == null) return Map.of("count", 0);
        int c = cartService.getItemCount(authId);
        return Map.of("count", c);
    }

    @PutMapping("/item/{id}")
    public Cart updateItem(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        int qty = ((Number) body.getOrDefault("quantity", 1)).intValue();
        try {
            return cartService.updateItemQuantity(id, qty);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/item/{id}")
    public void deleteItem(@PathVariable Long id, HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        if (authId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        cartService.removeItem(id);
    }
}
