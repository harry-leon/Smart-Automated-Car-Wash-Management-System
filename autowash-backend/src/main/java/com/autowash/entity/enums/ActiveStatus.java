package com.autowash.entity.enums;

/**
 * Stored as varchar with a database CHECK constraint.
 * Values: ACTIVE | INACTIVE
 * Used by: packages.status, services.status, combos.status,
 *          vouchers.status, promotions.status
 */
public enum ActiveStatus {
    ACTIVE,
    INACTIVE
}
