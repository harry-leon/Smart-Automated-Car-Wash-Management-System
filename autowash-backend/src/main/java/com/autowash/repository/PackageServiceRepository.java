package com.autowash.repository;

import com.autowash.entity.PackageService;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PackageServiceRepository extends JpaRepository<PackageService, PackageService.PackageServiceId> {
    List<PackageService> findByPackageIdOrderBySortOrderAsc(UUID packageId);

    List<PackageService> findByPackageIdAndOptionIdIn(UUID packageId, Collection<UUID> optionIds);

    void deleteByPackageId(UUID packageId);
}
