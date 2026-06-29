package com.autowash.service;

import com.autowash.dto.TickerNotificationResponse;
import com.autowash.dto.NotificationResponse;
import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> listMyNotifications(int limit);
    List<TickerNotificationResponse> listTickerNotifications(int limit);
    NotificationResponse markAsRead(UUID notificationId);
}
