package com.autowash.user.controller;

import com.autowash.shared.dto.ApiResponse;
import com.autowash.user.dto.UpdateUserProfileRequest;
import com.autowash.user.dto.UpdateUserProfileResponse;
import com.autowash.user.dto.UpdateUserPreferencesRequest;
import com.autowash.user.dto.UpdateUserPreferencesResponse;
import com.autowash.user.dto.UserPreferencesDto;
import com.autowash.user.dto.UserProfileResponse;
import com.autowash.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Profile")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get authenticated user's profile")
    public ApiResponse<UserProfileResponse> getProfile() {
        return ApiResponse.ok("Profile retrieved", userProfileService.getCurrentUserProfile());
    }

    @PutMapping("/profile")
    @Operation(summary = "Update authenticated user's profile")
    public ApiResponse<UpdateUserProfileResponse> updateProfile(@Valid @RequestBody UpdateUserProfileRequest request) {
        return ApiResponse.ok("Profile updated successfully", userProfileService.updateProfile(request));
    }

    @GetMapping("/preferences")
    @Operation(summary = "Get authenticated user's preferences")
    public ApiResponse<UserPreferencesDto> getPreferences() {
        return ApiResponse.ok("Preferences retrieved", userProfileService.getCurrentUserPreferences());
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update authenticated user's preferences")
    public ApiResponse<UpdateUserPreferencesResponse> updatePreferences(
            @Valid @RequestBody UpdateUserPreferencesRequest request
    ) {
        return ApiResponse.ok("Preferences updated", userProfileService.updatePreferences(request));
    }
}
