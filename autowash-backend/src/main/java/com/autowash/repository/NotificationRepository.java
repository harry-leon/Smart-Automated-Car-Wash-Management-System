package com.autowash.repository;

import com.autowash.entity.AuthUser;
import com.autowash.entity.Notification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @EntityGraph(attributePaths = {"user"})
    List<Notification> findByUserOrderByCreatedAtDesc(AuthUser user, Pageable pageable);

    long countByUserAndReadFalse(AuthUser user);
}
