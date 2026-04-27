package com.ecommerce.ecommerce_platform.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password"})
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"cart"})
    private List<CartItem> items = new ArrayList<>();

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items.clear();
        if (items == null) {
            return;
        }
        for (CartItem item : items) {
            item.setCart(this);
            this.items.add(item);
        }
    }

    public List<Product> getProducts() {
        return items.stream().map(CartItem::getProduct).toList();
    }

    public void setProducts(List<Product> products) {
        this.items.clear();
        if (products == null) {
            return;
        }
        for (Product product : products) {
            CartItem item = new CartItem();
            item.setCart(this);
            item.setProduct(product);
            item.setQuantity(1);
            item.setUnitPrice(product.getPrice());
            this.items.add(item);
        }
    }

}
