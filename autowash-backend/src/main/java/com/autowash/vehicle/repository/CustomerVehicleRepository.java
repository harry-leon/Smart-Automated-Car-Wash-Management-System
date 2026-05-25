package com.autowash.vehicle.repository;

import com.autowash.auth.entity.AuthUser;
import com.autowash.vehicle.entity.CustomerVehicle;
import com.autowash.vehicle.entity.VehicleStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerVehicleRepository extends JpaRepository<CustomerVehicle, UUID> {

    boolean existsByOwnerAndPlateAndStatus(AuthUser owner, String plate, VehicleStatus status);

    Optional<CustomerVehicle> findByOwnerAndIdAndStatus(AuthUser owner, UUID id, VehicleStatus status);

    Optional<CustomerVehicle> findFirstByOwnerAndStatusAndPrimaryTrue(AuthUser owner, VehicleStatus status);

    Optional<CustomerVehicle> findFirstByOwnerAndStatusOrderByCreatedAtAsc(AuthUser owner, VehicleStatus status);

    long countByOwnerAndStatus(AuthUser owner, VehicleStatus status);

    Page<CustomerVehicle> findByOwnerAndStatusOrderByCreatedAtAsc(AuthUser owner, VehicleStatus status, Pageable pageable);
}
