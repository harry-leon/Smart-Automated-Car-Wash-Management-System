package com.autowash.repository;

import com.autowash.entity.enums.PackageStatus;
import com.autowash.entity.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceAddonRepository extends JpaRepository<Service, UUID> {
    List<Service> findByStatusOrderByIdAsc(PackageStatus status);

    Optional<Service> findByIdAndStatus(UUID id, PackageStatus status);
}

