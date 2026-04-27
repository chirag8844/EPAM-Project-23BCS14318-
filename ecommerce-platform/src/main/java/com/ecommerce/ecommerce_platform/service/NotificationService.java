package com.ecommerce.ecommerce_platform.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.ecommerce_platform.entity.Notification;
import com.ecommerce.ecommerce_platform.entity.NotificationType;
import com.ecommerce.ecommerce_platform.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Long recipientId, NotificationType type, String message) {
        Notification n = new Notification(recipientId, type, message);
        return notificationRepository.save(n);
    }

    public List<Notification> getNotificationsForUser(Long recipientId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    public List<Notification> getNotificationsForVendor(Long vendorId) {
        return getNotificationsForUser(vendorId);
    }

    public Notification markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        return notificationRepository.save(n);
    }

    public long countUnread(Long recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }
}
