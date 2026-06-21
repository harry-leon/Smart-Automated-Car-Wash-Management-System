package com.autowash.repository;


import com.autowash.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerComboUsageRepository extends JpaRepository<CustomerComboUsage, Long> {
}
