package com.ecommerce.ecommerce_platform.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.ecommerce_platform.entity.Cart;
import com.ecommerce.ecommerce_platform.entity.CartItem;
import com.ecommerce.ecommerce_platform.dto.PlaceOrderRequest;
import com.ecommerce.ecommerce_platform.entity.NotificationType;
import com.ecommerce.ecommerce_platform.entity.Order;
import com.ecommerce.ecommerce_platform.entity.OrderItem;
import com.ecommerce.ecommerce_platform.entity.Product;
import com.ecommerce.ecommerce_platform.entity.User;
import com.ecommerce.ecommerce_platform.repository.CartItemRepository;
import com.ecommerce.ecommerce_platform.repository.CartRepository;
import com.ecommerce.ecommerce_platform.repository.OrderRepository;
import com.ecommerce.ecommerce_platform.repository.ProductRepository;
import com.ecommerce.ecommerce_platform.repository.UserRepository;

@Service
public class OrderService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Order placeOrder(Long userId) {
        return placeOrder(userId, null);
    }

    public Order placeOrder(Long userId, PlaceOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        List<CartItem> cartItems = cartItemRepository.findByCartIdOrderByIdAsc(cart.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Map<Long, Integer> requestedQuantities = new LinkedHashMap<>();
        if (request != null && request.getCartItems() != null && !request.getCartItems().isEmpty()) {
            for (PlaceOrderRequest.CartItemRequest itemRequest : request.getCartItems()) {
                if (itemRequest.getProductId() != null) {
                    requestedQuantities.put(itemRequest.getProductId(), itemRequest.getQuantity() == null ? 1 : itemRequest.getQuantity());
                }
            }
        }

        List<CartItem> checkoutItems = new ArrayList<>(cartItems);
        if (!requestedQuantities.isEmpty()) {
            Set<Long> requestedProductIds = requestedQuantities.keySet();
            checkoutItems = cartItems.stream()
                    .filter(item -> item.getProduct() != null && requestedProductIds.contains(item.getProduct().getId()))
                    .collect(Collectors.toList());
            if (checkoutItems.size() != requestedProductIds.size()) {
                throw new RuntimeException("Some requested cart items are invalid");
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setPaymentMethod(normalizePaymentMethod(request != null ? request.getPaymentMethod() : null));
        order.setDeliveryName(resolveDeliveryName(user, request));
        order.setDeliveryAddress(resolveDeliveryAddress(request));
        order.setDeliveryPhone(resolveDeliveryPhone(request));

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (CartItem cartItem : checkoutItems) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            int requestedQty = requestedQuantities.isEmpty()
                    ? cartItem.getQuantity()
                    : requestedQuantities.getOrDefault(product.getId(), cartItem.getQuantity());
            if (requestedQty <= 0) {
                throw new RuntimeException("Quantity must be at least 1");
            }
            if (requestedQty > cartItem.getQuantity()) {
                throw new RuntimeException("Requested quantity is not available in cart");
            }
            if (requestedQty > product.getQuantity()) {
                throw new RuntimeException(product.getName() + " is out of stock");
            }

            product.setQuantity(product.getQuantity() - requestedQty);
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(requestedQty);
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItems.add(orderItem);
            total += cartItem.getUnitPrice() * requestedQty;
        }

        order.setItems(orderItems);
        order.setTotalPrice(total);
        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : savedOrder.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                String productName = product.getName() != null ? product.getName() : "Unknown Product";
                String brandName = product.getBrand() != null && !product.getBrand().isBlank() ? product.getBrand() : "Unknown Brand";
                
                // User Notification
                String userMessage = "New order placed for " + productName + " (" + brandName + ")";
                notificationService.createNotification(userId, NotificationType.ORDER, userMessage);

                // Vendor Notification
                if (product.getVendor() != null && product.getVendor().getId() != null) {
                    String vendorMessage = "New order received for your product: " + productName + " (" + brandName + ")";
                    notificationService.createNotification(product.getVendor().getId(), NotificationType.ORDER, vendorMessage);
                }
            }
        }

        for (CartItem cartItem : checkoutItems) {
            int requestedQty = requestedQuantities.isEmpty()
                    ? cartItem.getQuantity()
                    : requestedQuantities.getOrDefault(cartItem.getProduct().getId(), cartItem.getQuantity());
            if (requestedQty >= cartItem.getQuantity()) {
                cartItemRepository.delete(cartItem);
            } else {
                cartItem.setQuantity(cartItem.getQuantity() - requestedQty);
                cartItemRepository.save(cartItem);
            }
        }
        return savedOrder;
    }

    public List<Order> getOrdersForUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order placeFullOrder(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        return placeOrder(cart.getUser().getId(), null);
    }

    public Order placeSelectedOrder(Long cartId, List<Long> productIds) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setCartItems(productIds.stream().map(productId -> {
            PlaceOrderRequest.CartItemRequest itemRequest = new PlaceOrderRequest.CartItemRequest();
            itemRequest.setProductId(productId);
            itemRequest.setQuantity(1);
            return itemRequest;
        }).toList());
        return placeOrder(cart.getUser().getId(), request);
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "CASH_ON_DELIVERY";
        }
        return paymentMethod;
    }

    private String resolveDeliveryName(User user, PlaceOrderRequest request) {
        if (request != null && request.getDeliveryDetails() != null && request.getDeliveryDetails().getName() != null
                && !request.getDeliveryDetails().getName().isBlank()) {
            return request.getDeliveryDetails().getName();
        }
        return user.getName();
    }

    private String resolveDeliveryAddress(PlaceOrderRequest request) {
        if (request != null && request.getDeliveryDetails() != null) {
            return request.getDeliveryDetails().getAddress();
        }
        return null;
    }

    private String resolveDeliveryPhone(PlaceOrderRequest request) {
        if (request != null && request.getDeliveryDetails() != null) {
            return request.getDeliveryDetails().getPhone();
        }
        return null;
    }
}
