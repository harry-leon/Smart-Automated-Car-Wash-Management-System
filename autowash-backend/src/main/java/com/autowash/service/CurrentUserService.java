package com.autowash.service;

import com.autowash.entity.AuthUser;
import com.autowash.repository.AuthUserRepository;
import com.autowash.shared.exception.ApiException;
import com.autowash.shared.security.AuthUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final AuthUserRepository authUserRepository;

    public CurrentUserService(AuthUserRepository authUserRepository) {
        this.authUserRepository = authUserRepository;
    }

    public AuthUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required", "UNAUTHORIZED");
        }

        return authUserRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found", "RESOURCE_NOT_FOUND"));
    }
}
