package com.autowash.auth.application;

import com.autowash.auth.domain.AuthUser;
import com.autowash.auth.domain.UserRole;
import com.autowash.auth.domain.UserStatus;
import com.autowash.auth.infrastructure.AuthUserRepository;
import com.autowash.auth.presentation.dto.AuthUserResponse;
import com.autowash.auth.presentation.dto.LoginRequest;
import com.autowash.auth.presentation.dto.LoginResponse;
import com.autowash.auth.presentation.dto.RegisterRequest;
import com.autowash.shared.exception.ApiException;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private final AuthUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(
            AuthUserRepository users,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public AuthUserResponse register(RegisterRequest request) {
        if (!request.password().equals(request.passwordConfirm())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Password confirmation does not match");
        }

        String phone = normalizePhone(request.phone());
        String email = normalizeEmail(request.email());

        if (users.existsByPhone(phone)) {
            throw duplicatePhone();
        }

        if (StringUtils.hasText(email) && users.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", "Email is already registered");
        }

        AuthUser user = new AuthUser(
                request.fullName().trim(),
                phone,
                email,
                passwordEncoder.encode(request.password()),
                UserRole.CUSTOMER,
                UserStatus.ACTIVE
        );

        try {
            AuthUser savedUser = users.save(user);
            return AuthUserResponse.from(savedUser);
        } catch (DataIntegrityViolationException exception) {
            throw duplicatePhone();
        }
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String phone = normalizePhone(request.phone());
        AuthUser user = users.findByPhone(phone)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "ACCOUNT_NOT_ACTIVE",
                    "Account is not active"
            );
        }

        String accessToken = jwtTokenService.createAccessToken(user);
        return LoginResponse.from(user, accessToken, jwtTokenService.getAccessTokenTtlSeconds());
    }

    private String normalizePhone(String phone) {
        return phone.trim();
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private ApiException duplicatePhone() {
        return new ApiException(HttpStatus.CONFLICT, "DUPLICATE_PHONE", "Phone number is already registered");
    }

    private ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid phone number or password");
    }
}
