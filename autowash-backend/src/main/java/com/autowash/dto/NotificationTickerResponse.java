package com.autowash.dto;

import java.util.List;

public record NotificationTickerResponse(
        List<NotificationTickerItem> items
) {}
