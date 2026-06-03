package com.autowash.auth.repository;

import com.autowash.auth.entity.UserRole;
import com.autowash.auth.entity.UserStatus;
import com.autowash.auth.entity.AuthUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuthUserRepository extends JpaRepository<AuthUser, UUID> {

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, UUID id);

    Optional<AuthUser> findByPhone(String phone);

    Optional<AuthUser> findByEmailIgnoreCase(String email);

    long countByRole(UserRole role);

    @Query("""
            SELECT account FROM AuthUser account
            WHERE (:role IS NULL OR account.role = :role)
              AND (:status IS NULL OR account.status = :status)
              AND (
                :searchLike IS NULL
                OR LOWER(account.fullName) LIKE :searchLike
                OR LOWER(account.phone) LIKE :searchLike
                OR LOWER(COALESCE(account.email, '')) LIKE :searchLike
              )
            """)
    Page<AuthUser> searchAccounts(
            @Param("role") UserRole role,
            @Param("status") UserStatus status,
            @Param("searchLike") String searchLike,
            Pageable pageable
    );
}
