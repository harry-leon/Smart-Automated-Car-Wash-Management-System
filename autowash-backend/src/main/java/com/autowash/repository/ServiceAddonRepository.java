package com.autowash.repository;

import com.autowash.entity.enums.PackageStatus;
import com.autowash.entity.ServiceAddon;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceAddonRepository extends JpaRepository<ServiceAddon, String> {
    List<ServiceAddon> findByStatusOrderByIdAsc(PackageStatus status);
    Optional<ServiceAddon> findByIdAndStatus(String id, PackageStatus status);
}
