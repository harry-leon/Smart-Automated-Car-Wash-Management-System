package com.autowash.auth.repository;

import com.autowash.auth.entity.UserRole;
import com.autowash.auth.entity.AuthUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthUserRepository extends JpaRepository<AuthUser, UUID> {

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, UUID id);

    Optional<AuthUser> findByPhone(String phone);

    Optional<AuthUser> findByEmailIgnoreCase(String email);

    long countByRole(UserRole role);
}
