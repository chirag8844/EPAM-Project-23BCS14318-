package com.ecommerce.ecommerce_platform.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.ecommerce_platform.entity.Cart;
import com.ecommerce.ecommerce_platform.entity.CartItem;
import com.ecommerce.ecommerce_platform.entity.Product;
import com.ecommerce.ecommerce_platform.entity.User;
import com.ecommerce.ecommerce_platform.exception.InvalidUserRoleException;
import com.ecommerce.ecommerce_platform.repository.CartItemRepository;
import com.ecommerce.ecommerce_platform.repository.CartRepository;
import com.ecommerce.ecommerce_platform.repository.ProductRepository;
import com.ecommerce.ecommerce_platform.repository.UserRepository;

@Service
public class CartService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    private static final double MAX_CART_AMOUNT = 200000;

    public Cart createCart(Cart cart) {
        Long userId = cart.getUser().getId();
        User user = getCustomer(userId);
        cart.setUser(user);
        cart.setItems(new ArrayList<>());
        return cartRepository.save(cart);
    }

    public Cart getOrCreateCart(Long userId) {
        User user = getCustomer(userId);
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart freshCart = new Cart();
            freshCart.setUser(user);
            freshCart.setItems(new ArrayList<>());
            return cartRepository.save(freshCart);
        });
        hydrateItems(cart);
        return cart;
    }

    public Cart addToCart(Long userId, Long productId, int qty) {
        if (qty <= 0) {
            throw new RuntimeException("Quantity must be at least 1");
        }
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity() <= 0) {
            throw new RuntimeException("Product out of stock");
        }
        if (qty > product.getQuantity()) {
            throw new RuntimeException("Requested quantity exceeds available stock");
        }

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct() != null && productId.equals(item.getProduct().getId()))
                .findFirst()
                .orElse(null);

        double currentTotal = cart.getItems().stream()
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();
        double delta = product.getPrice() * qty;
        if (existingItem != null) {
            delta = product.getPrice() * qty - (existingItem.getUnitPrice() * existingItem.getQuantity());
        }
        if (currentTotal + delta > MAX_CART_AMOUNT) {
            throw new RuntimeException("Cart amount limit exceeded");
        }

        if (existingItem == null) {
            existingItem = new CartItem();
            existingItem.setCart(cart);
            existingItem.setProduct(product);
            existingItem.setQuantity(qty);
            existingItem.setUnitPrice(product.getPrice());
        } else {
            existingItem.setQuantity(qty);
            existingItem.setUnitPrice(product.getPrice());
        }
        cartItemRepository.save(existingItem);
        return getOrCreateCart(userId);
    }

    public int getItemCount(Long userId) {
        return (int) cartItemRepository.countByCartUserId(userId);
    }

    public Cart updateItemQuantity(Long itemId, int qty) {
        if (qty <= 0) {
            throw new RuntimeException("Quantity must be at least 1");
        }
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        Product product = item.getProduct();
        if (product == null) {
            throw new RuntimeException("Product not found");
        }
        if (qty > product.getQuantity()) {
            throw new RuntimeException("Requested quantity exceeds available stock");
        }
        item.setQuantity(qty);
        item.setUnitPrice(product.getPrice());
        cartItemRepository.save(item);
        return getOrCreateCart(item.getCart().getUser().getId());
    }

    public void removeItem(Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartItemRepository.delete(item);
    }

    public Cart getCartById(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        hydrateItems(cart);
        return cart;
    }

    public Cart addProductToCart(Long cartId, Long productId) {
        Cart cart = getCartById(cartId);
        return addToCart(cart.getUser().getId(), productId, 1);
    }

    public Cart removeProductFromCart(Long cartId, Long productId) {
        Cart cart = getCartById(cartId);
        CartItem item = cart.getItems().stream()
                .filter(existing -> existing.getProduct() != null && productId.equals(existing.getProduct().getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not present in cart"));
        removeItem(item.getId());
        return getOrCreateCart(cart.getUser().getId());
    }

    private User getCustomer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRole().name().equals("CUSTOMER")) {
            throw new InvalidUserRoleException("Only customers can have carts");
        }
        return user;
    }

    private void hydrateItems(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartIdOrderByIdAsc(cart.getId());
        cart.setItems(new ArrayList<>(items));
    }
}
