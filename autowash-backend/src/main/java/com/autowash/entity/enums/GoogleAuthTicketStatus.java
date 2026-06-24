package com.autowash.entity.enums;

public enum GoogleAuthTicketStatus {
    PENDING,        // ticket created, waiting for Google callback
    LINK_REQUIRED,  // Google email matches existing account — user must confirm
    READY,          // callback processed, ready to exchange for JWT
    CONSUMED,       // JWT issued, ticket used up
    EXPIRED         // TTL elapsed
}
