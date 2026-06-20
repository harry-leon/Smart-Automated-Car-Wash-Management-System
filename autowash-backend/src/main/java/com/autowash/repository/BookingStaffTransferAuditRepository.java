package com.autowash.repository;


import com.autowash.entity.*;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingStaffTransferAuditRepository extends JpaRepository<BookingStaffTransferAudit, UUID> {

    @EntityGraph(attributePaths = {"booking", "washSession", "fromStaff", "toStaff", "actor"})
    Page<BookingStaffTransferAudit> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
