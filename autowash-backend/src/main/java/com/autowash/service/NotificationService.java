package com.autowash.service;

import com.autowash.dto.NotificationResponse;
import com.autowash.entity.AuthUser;
import com.autowash.entity.Notification;
import com.autowash.repository.NotificationRepository;
import com.autowash.shared.exception.ApiException;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final CurrentUserService currentUserService;
    private final NotificationRepository notificationRepository;

    public NotificationService(CurrentUserService currentUserService, NotificationRepository notificationRepository) {
        this.currentUserService = currentUserService;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listMyNotifications(int limit) {
        AuthUser user = currentUserService.getCurrentUser();
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, safeLimit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {
        AuthUser user = currentUserService.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found", "RESOURCE_NOT_FOUND"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Notification not found", "RESOURCE_NOT_FOUND");
        }
        notification.markAsRead();
        return toResponse(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
