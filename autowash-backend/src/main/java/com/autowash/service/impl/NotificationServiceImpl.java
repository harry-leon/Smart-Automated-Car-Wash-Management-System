package com.autowash.service.impl;

import com.autowash.service.*;
import com.autowash.dto.CustomerPromotionResponse;
import com.autowash.dto.NotificationResponse;
import com.autowash.dto.TickerNotificationResponse;
import com.autowash.entity.User;
import com.autowash.entity.Notification;
import com.autowash.repository.NotificationRepository;
import com.autowash.service.PromotionService;
import com.autowash.shared.exception.ApiException;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final CurrentUserService currentUserService;
    private final NotificationRepository notificationRepository;
    private final PromotionService promotionService;

    public NotificationServiceImpl(
            CurrentUserService currentUserService,
            NotificationRepository notificationRepository,
            PromotionService promotionService
    ) {
        this.currentUserService = currentUserService;
        this.notificationRepository = notificationRepository;
        this.promotionService = promotionService;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listMyNotifications(int limit) {
        User user = currentUserService.getCurrentUser();
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, safeLimit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TickerNotificationResponse> listTickerNotifications(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 30));
        List<TickerNotificationResponse> promotionItems = promotionService.listActiveLegacyForCurrentCustomer().stream()
                .limit(safeLimit)
                .map(this::toTickerPromotion)
                .toList();
        if (promotionItems.size() >= safeLimit) {
            return promotionItems;
        }

        List<TickerNotificationResponse> notificationItems = listMyNotifications(safeLimit).stream()
                .map(this::toTickerNotification)
                .toList();

        return java.util.stream.Stream.concat(promotionItems.stream(), notificationItems.stream())
                .limit(safeLimit)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {
        User user = currentUserService.getCurrentUser();
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

    private TickerNotificationResponse toTickerPromotion(CustomerPromotionResponse promotion) {
        return new TickerNotificationResponse(
                "PROMOTION",
                promotion.title(),
                "Promotion available: " + promotion.title(),
                promotion.expiresAt()
        );
    }

    private TickerNotificationResponse toTickerNotification(NotificationResponse notification) {
        return new TickerNotificationResponse(
                notification.type(),
                notification.title(),
                notification.message(),
                notification.createdAt()
        );
    }
}
