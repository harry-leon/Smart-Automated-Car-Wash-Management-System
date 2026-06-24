package com.autowash.service.impl;

import com.autowash.entity.User;
import com.autowash.entity.UserPreference;
import com.autowash.repository.UserRepository;
import com.autowash.repository.UserPreferenceRepository;
import com.autowash.service.CurrentUserService;
import com.autowash.service.CustomerLoyaltyService;
import com.autowash.service.LoyaltyService;
import com.autowash.service.UserProfileService;
import com.autowash.shared.exception.ApiException;
import com.autowash.dto.UpdateUserProfileRequest;
import com.autowash.dto.UpdateUserProfileResponse;
import com.autowash.dto.UpdateUserPreferencesRequest;
import com.autowash.dto.UpdateUserPreferencesResponse;
import com.autowash.dto.UserPreferencesDto;
import com.autowash.dto.UserProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final CurrentUserService currentUserService;
    private final UserRepository UserRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final CustomerLoyaltyService customerLoyaltyService;
    private final LoyaltyService loyaltyService;

    public UserProfileServiceImpl(
            CurrentUserService currentUserService,
            UserRepository UserRepository,
            UserPreferenceRepository userPreferenceRepository,
            CustomerLoyaltyService customerLoyaltyService,
            LoyaltyService loyaltyService
    ) {
        this.currentUserService = currentUserService;
        this.UserRepository = UserRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.customerLoyaltyService = customerLoyaltyService;
        this.loyaltyService = loyaltyService;
    }

    @Override
    public UserProfileResponse getCurrentUserProfile() {
        User user = currentUserService.getCurrentUser();
        UserPreference preference = loadOrCreatePreference(user);
        return new UserProfileResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getStatus().name(),
                user.getRole().name(),
                loyaltyService.getAccount(user.getId()).tier(),
                user.isNewCustomer(),
                customerLoyaltyService.getCurrentBalance(user),
                user.getCreatedAt(),
                new UserPreferencesDto(
                        preference.getLanguage().name(),
                        preference.getTheme().name(),
                        preference.isNotificationsEnabled(),
                        preference.isEmailNotifications(),
                        preference.isSmsNotifications()
                )
        );
    }

    @Override
    @Transactional
    public UpdateUserProfileResponse updateProfile(UpdateUserProfileRequest request) {
        User user = currentUserService.getCurrentUser();
        if (UserRepository.existsByPhoneAndIdNot(request.phone(), user.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone number already in use", "DUPLICATE_PHONE");
        }
        if (request.email() != null && UserRepository.existsByEmailIgnoreCaseAndIdNot(request.email(), user.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already in use", "DUPLICATE_EMAIL");
        }

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.markNotNewCustomer();

        return new UpdateUserProfileResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getUpdatedAt()
        );
    }

    @Override
    public UserPreferencesDto getCurrentUserPreferences() {
        User user = currentUserService.getCurrentUser();
        UserPreference preference = loadOrCreatePreference(user);
        return new UserPreferencesDto(
                preference.getLanguage().name(),
                preference.getTheme().name(),
                preference.isNotificationsEnabled(),
                preference.isEmailNotifications(),
                preference.isSmsNotifications()
        );
    }

    @Override
    @Transactional
    public UpdateUserPreferencesResponse updatePreferences(UpdateUserPreferencesRequest request) {
        User user = currentUserService.getCurrentUser();
        UserPreference preference = loadOrCreatePreference(user);
        preference.update(
                request.language(),
                request.theme(),
                request.notificationsEnabled(),
                request.emailNotifications(),
                request.smsNotifications()
        );

        return new UpdateUserPreferencesResponse(
                preference.getLanguage().name(),
                preference.getTheme().name(),
                preference.isNotificationsEnabled(),
                user.getUpdatedAt()
        );
    }

    private UserPreference loadOrCreatePreference(User user) {
        return userPreferenceRepository.findById(user.getId())
                .orElseGet(() -> userPreferenceRepository.save(new UserPreference(user)));
    }
}
