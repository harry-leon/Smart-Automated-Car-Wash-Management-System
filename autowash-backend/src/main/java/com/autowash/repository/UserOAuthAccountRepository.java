package com.autowash.repository;

import com.autowash.entity.UserOAuthAccount;
import com.autowash.entity.enums.OAuthProvider;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserOAuthAccountRepository extends JpaRepository<UserOAuthAccount, UUID> {

    Optional<UserOAuthAccount> findByProviderAndProviderUserId(OAuthProvider provider, String providerUserId);

    boolean existsByUserId(UUID userId);
}
