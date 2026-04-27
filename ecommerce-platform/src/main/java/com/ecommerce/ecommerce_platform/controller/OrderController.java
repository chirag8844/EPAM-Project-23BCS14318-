package com.ecommerce.ecommerce_platform.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.ecommerce_platform.entity.Order;
import com.ecommerce.ecommerce_platform.dto.PlaceOrderRequest;
import com.ecommerce.ecommerce_platform.service.OrderService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Order placeOrder(@RequestBody(required = false) PlaceOrderRequest body, HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        if (authId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        return orderService.placeOrder(authId, body);
    }

    @GetMapping
    public List<Order> listOrders(HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        if (authId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        return orderService.getOrdersForUser(authId);
    }
}
