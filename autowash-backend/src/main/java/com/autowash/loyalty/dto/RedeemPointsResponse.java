package com.autowash.loyalty.dto;

import java.util.UUID;

public record RedeemPointsResponse(
        UUID transactionId,
        int pointsRedeemed,
        int newBalance
) {
}
