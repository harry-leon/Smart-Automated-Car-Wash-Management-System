package com.autowash.repository;

import com.autowash.entity.ServiceCombo;
import com.autowash.enums.PackageStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceComboRepository extends JpaRepository<ServiceCombo, UUID> {
    List<ServiceCombo> findByStatusOrderByIdAsc(PackageStatus status);

    default Optional<ServiceCombo> findById(String id) {
        return id == null || id.isBlank() ? Optional.empty() : findById(UUID.fromString(id));
    }

    default List<ServiceCombo> findByActiveTrueOrderByIdAsc() {
        return findByStatusOrderByIdAsc(PackageStatus.ACTIVE);
    }

    default Optional<ServiceCombo> findByIdAndActiveTrue(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return findById(UUID.fromString(id)).filter(ServiceCombo::isActive);
    }
}
