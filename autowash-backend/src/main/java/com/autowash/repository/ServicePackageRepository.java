package com.autowash.repository;

import com.autowash.entity.enums.PackageStatus;
import com.autowash.entity.ServicePackage;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, UUID> {
    Page<ServicePackage> findByStatusOrderByIdAsc(PackageStatus status, Pageable pageable);

    default Optional<ServicePackage> findById(String id) {
        return parseUuid(id).flatMap(this::findById);
    }

    private static Optional<UUID> parseUuid(String id) {
        try {
            return id == null || id.isBlank() ? Optional.empty() : Optional.of(UUID.fromString(id));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }
}
