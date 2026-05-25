package com.autowash.user.service;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.shared.exception.ApiException;
import com.autowash.user.dto.UpdateUserProfileRequest;
import com.autowash.user.dto.UpdateUserProfileResponse;
import com.autowash.user.dto.UpdateUserPreferencesRequest;
import com.autowash.user.dto.UpdateUserPreferencesResponse;
import com.autowash.user.dto.UserPreferencesDto;
import com.autowash.user.dto.UserProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private static final int TEMPORARY_LOYALTY_BALANCE = 0;

    private final CurrentUserService currentUserService;
    private final AuthUserRepository authUserRepository;

    public UserProfileService(CurrentUserService currentUserService, AuthUserRepository authUserRepository) {
        this.currentUserService = currentUserService;
        this.authUserRepository = authUserRepository;
    }

    public UserProfileResponse getCurrentUserProfile() {
        AuthUser user = currentUserService.getCurrentUser();
        return new UserProfileResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getStatus().name(),
                user.getRole().name(),
                user.getTier().name(),
                user.isNewCustomer(),
                // Intentionally fixed at 0 for mandatory-first scope until loyalty accounting is implemented.
                TEMPORARY_LOYALTY_BALANCE,
                user.getCreatedAt(),
                new UserPreferencesDto(
                        user.getLanguage().name(),
                        user.getTheme().name(),
                        user.isNotificationsEnabled(),
                        user.isEmailNotifications(),
                        user.isSmsNotifications()
                )
        );
    }

    @Transactional
    public UpdateUserProfileResponse updateProfile(UpdateUserProfileRequest request) {
        AuthUser user = currentUserService.getCurrentUser();
        if (authUserRepository.existsByPhoneAndIdNot(request.phone(), user.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone number already in use", "DUPLICATE_PHONE");
        }

        user.updateProfile(request.fullName(), request.email(), request.phone());

        return new UpdateUserProfileResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getUpdatedAt()
        );
    }

    public UserPreferencesDto getCurrentUserPreferences() {
        AuthUser user = currentUserService.getCurrentUser();
        return new UserPreferencesDto(
                user.getLanguage().name(),
                user.getTheme().name(),
                user.isNotificationsEnabled(),
                user.isEmailNotifications(),
                user.isSmsNotifications()
        );
    }

    @Transactional
    public UpdateUserPreferencesResponse updatePreferences(UpdateUserPreferencesRequest request) {
        AuthUser user = currentUserService.getCurrentUser();
        user.updatePreferences(
                request.language(),
                request.theme(),
                request.notificationsEnabled(),
                request.emailNotifications(),
                request.smsNotifications()
        );

        return new UpdateUserPreferencesResponse(
                user.getLanguage().name(),
                user.getTheme().name(),
                user.isNotificationsEnabled(),
                user.getUpdatedAt()
        );
    }
}
