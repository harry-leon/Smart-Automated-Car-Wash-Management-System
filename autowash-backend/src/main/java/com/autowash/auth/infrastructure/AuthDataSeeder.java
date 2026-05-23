package com.autowash.auth.infrastructure;

import com.autowash.auth.domain.AuthUser;
import com.autowash.auth.domain.UserRole;
import com.autowash.auth.domain.UserStatus;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AuthDataSeeder implements ApplicationRunner {

    private final AuthUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthDataSeeder(AuthUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedIfMissing("AutoWash Admin", "0900000001", "admin@autowash.local", "Admin@123", UserRole.ADMIN);
        seedIfMissing("AutoWash Staff 1", "0900000002", "staff@autowash.local", "Staff@123", UserRole.STAFF);
        seedIfMissing("AutoWash Staff 2", "0900000003", "staff2@autowash.local", "Staff@123", UserRole.STAFF);
        seedIfMissing("Demo Customer", "0900000004", "customer@autowash.local", "Customer@123", UserRole.CUSTOMER);
    }

    private void seedIfMissing(String fullName, String phone, String email, String password, UserRole role) {
        if (users.existsByPhone(phone)) {
            return;
        }

        AuthUser user = new AuthUser(
                fullName,
                phone,
                email,
                passwordEncoder.encode(password),
                role,
                UserStatus.ACTIVE
        );

        users.save(user);
    }
}
