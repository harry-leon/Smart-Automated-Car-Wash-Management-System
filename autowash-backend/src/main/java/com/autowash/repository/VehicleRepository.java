package com.autowash.repository;

import com.autowash.entity.User;
import com.autowash.entity.Vehicle;
import com.autowash.entity.enums.VehicleStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    boolean existsByPlate(String plate);

    boolean existsByOwnerAndPlate(User owner, String plate);

    Optional<Vehicle> findByOwnerAndIdAndStatus(User owner, UUID id, VehicleStatus status);

    Optional<Vehicle> findFirstByOwnerAndStatusAndPrimaryTrue(User owner, VehicleStatus status);

    Optional<Vehicle> findFirstByOwnerAndStatusOrderByCreatedAtAsc(User owner, VehicleStatus status);

    long countByOwnerAndStatus(User owner, VehicleStatus status);

    Page<Vehicle> findByOwnerAndStatusOrderByCreatedAtAsc(User owner, VehicleStatus status, Pageable pageable);
}

