package com.autowash.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record TransferWashSessionRequest(
        @NotNull UUID toStaffId,
        @Size(max = 500) String reason
) {
}
