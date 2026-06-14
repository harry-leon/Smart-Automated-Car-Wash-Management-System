package com.autowash.repository;

import com.autowash.entity.PackageStatus;
import com.autowash.entity.ServicePackage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, String> {
    Page<ServicePackage> findByStatusOrderByIdAsc(PackageStatus status, Pageable pageable);
}
