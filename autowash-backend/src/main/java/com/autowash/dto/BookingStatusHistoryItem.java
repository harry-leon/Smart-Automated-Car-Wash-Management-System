package com.autowash.dto;

import java.time.Instant;

public record BookingStatusHistoryItem(
    String oldStatus,
    String newStatus,
    String changedByName,
    String reason,
    Instant changedAt
) {}