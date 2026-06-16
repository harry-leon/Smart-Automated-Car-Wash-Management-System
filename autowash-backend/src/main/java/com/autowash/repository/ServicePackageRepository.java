package com.autowash.repository;

import com.autowash.enums.PackageStatus;
import com.autowash.entity.ServicePackage;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, UUID> {
    Page<ServicePackage> findByStatusOrderByIdAsc(PackageStatus status, Pageable pageable);

    default Optional<ServicePackage> findById(String id) {
        return id == null || id.isBlank() ? Optional.empty() : findById(UUID.fromString(id));
    }
}
