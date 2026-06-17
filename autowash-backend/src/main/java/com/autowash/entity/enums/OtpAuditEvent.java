package com.autowash.enums;

import com.autowash.enums.OtpAuditEvent;

public enum OtpAuditEvent {
    GENERATE,
    SEND_SUCCESS,
    SEND_FAILED,
    RESEND,
    VERIFY_SUCCESS,
    VERIFY_FAIL,
    EXPIRED,
    LOCKED
}
