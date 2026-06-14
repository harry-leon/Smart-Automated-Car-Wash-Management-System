package com.autowash.operation.dto;

import java.util.UUID;

public record StaffOptionResponse(
        UUID staffId,
        String staffName
) {
}
