package com.autowash.entity;

public enum BookingOtpAuditEvent {
    SEND_SUCCESS,
    SEND_FAILED,
    RESEND,
    VERIFY_SUCCESS,
    VERIFY_FAILED,
    EXPIRED,
    CANCELLED
}
