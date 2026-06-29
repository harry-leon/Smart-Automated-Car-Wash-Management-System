package com.autowash.service;

import com.autowash.dto.NotificationTickerResponse;
import com.autowash.dto.NotificationResponse;
import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> listMyNotifications(int limit);
    NotificationResponse markAsRead(UUID notificationId);
    NotificationTickerResponse getTicker();
}
