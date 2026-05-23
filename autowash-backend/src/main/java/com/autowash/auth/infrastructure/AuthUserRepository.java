package com.autowash.auth.infrastructure;

import com.autowash.auth.domain.AuthUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthUserRepository extends JpaRepository<AuthUser, UUID> {

    boolean existsByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);

    Optional<AuthUser> findByPhone(String phone);
}
