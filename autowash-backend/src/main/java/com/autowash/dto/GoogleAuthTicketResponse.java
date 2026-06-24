package com.autowash.dto;

/**
 * Response for GET /auth/google/tickets/{state}
 * Matches frontend GoogleAuthTicketResponse type exactly.
 */
public record GoogleAuthTicketResponse(
        String state,
        String status,              // PENDING | LINK_REQUIRED | READY | CONSUMED | EXPIRED
        String providerEmail,
        String providerFullName,
        String providerAvatarUrl,
        String returnUrl,
        String userId,              // null for brand-new users
        boolean linkRequired,
        boolean expired
) {
}
