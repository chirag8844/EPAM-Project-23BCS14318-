package com.ecommerce.ecommerce_platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.ecommerce_platform.entity.Notification;
import com.ecommerce.ecommerce_platform.entity.NotificationType;
import com.ecommerce.ecommerce_platform.service.NotificationService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Notification> getForCurrentUser(HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        if (authId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        return notificationService.getNotificationsForUser(authId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        if (authId == null) {
            return Map.of("count", 0L);
        }
        return Map.of("count", notificationService.countUnread(authId));
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Notification> getForVendor(@PathVariable Long vendorId) {
        return notificationService.getNotificationsForVendor(vendorId);
    }

    @PutMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PostMapping
    public Notification create(@RequestBody CreateNotificationRequest req) {
        return notificationService.createNotification(req.getVendorId(), req.getType(), req.getMessage());
    }

    public static class CreateNotificationRequest {
        private Long vendorId;
        private NotificationType type;
        private String message;

        public Long getVendorId() { return vendorId; }
        public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
        public NotificationType getType() { return type; }
        public void setType(NotificationType type) { this.type = type; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
