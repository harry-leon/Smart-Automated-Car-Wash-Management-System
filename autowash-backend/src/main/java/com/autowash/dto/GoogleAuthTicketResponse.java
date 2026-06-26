package com.autowash.dto;

public record GoogleAuthTicketResponse(
        String state,
        String status,
        String providerEmail,
        String providerFullName,
        String providerAvatarUrl,
        String returnUrl,
        String userId,
        boolean linkRequired,
        boolean expired
) {
}
