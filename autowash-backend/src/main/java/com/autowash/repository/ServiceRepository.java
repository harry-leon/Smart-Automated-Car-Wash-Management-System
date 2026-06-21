package com.autowash.repository;

import com.autowash.entity.enums.ActiveStatus;
import com.autowash.entity.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {
    List<Service> findByStatusOrderByIdAsc(ActiveStatus status);
    Optional<Service> findByIdAndStatus(UUID id, ActiveStatus status);
}
