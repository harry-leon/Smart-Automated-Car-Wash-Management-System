package com.autowash.dto;

import java.util.UUID;

public record StaffOptionResponse(
        UUID staffId,
        String staffName
) {
}
