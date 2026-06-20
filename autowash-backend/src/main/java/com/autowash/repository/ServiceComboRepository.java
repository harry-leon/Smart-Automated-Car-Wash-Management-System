package com.autowash.repository;

import com.autowash.entity.enums.PackageStatus;
import com.autowash.entity.ServiceCombo;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceComboRepository extends JpaRepository<ServiceCombo, UUID> {
    List<ServiceCombo> findByStatusOrderByIdAsc(com.autowash.entity.enums.PackageStatus status);

    default List<ServiceCombo> findByActiveTrueOrderByIdAsc() {
        return findByStatusOrderByIdAsc(com.autowash.entity.enums.PackageStatus.ACTIVE);
    }

    default Optional<ServiceCombo> findById(String id) {
        return parseUuid(id).flatMap(this::findById);
    }

    default Optional<ServiceCombo> findByIdAndActiveTrue(String id) {
        return findById(id).filter(ServiceCombo::isActive);
    }

    private static Optional<UUID> parseUuid(String id) {
        try {
            return id == null || id.isBlank() ? Optional.empty() : Optional.of(UUID.fromString(id));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }
}
