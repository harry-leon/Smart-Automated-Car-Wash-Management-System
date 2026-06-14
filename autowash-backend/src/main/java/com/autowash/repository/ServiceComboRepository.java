package com.autowash.repository;

import com.autowash.entity.ServiceCombo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceComboRepository extends JpaRepository<ServiceCombo, String> {
    List<ServiceCombo> findByActiveTrueOrderByIdAsc();
    Optional<ServiceCombo> findByIdAndActiveTrue(String id);
}
