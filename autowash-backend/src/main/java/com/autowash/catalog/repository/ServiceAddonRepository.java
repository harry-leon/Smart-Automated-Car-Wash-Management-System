package com.autowash.catalog.repository;

import com.autowash.catalog.entity.PackageStatus;
import com.autowash.catalog.entity.ServiceAddon;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceAddonRepository extends JpaRepository<ServiceAddon, String> {
    List<ServiceAddon> findByStatusOrderByIdAsc(PackageStatus status);
    Optional<ServiceAddon> findByIdAndStatus(String id, PackageStatus status);
}
