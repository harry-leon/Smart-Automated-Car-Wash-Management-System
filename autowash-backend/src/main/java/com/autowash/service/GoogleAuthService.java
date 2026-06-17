package com.autowash.service;

import com.autowash.dto.GoogleAuthTicketResponse;
import com.autowash.dto.GoogleOAuthUserInfo;
import com.autowash.dto.LoginResponse;
import com.autowash.entity.AuthUser;
import com.autowash.entity.GoogleAuthTicket;
import com.autowash.enums.GoogleAuthTicketStatus;
import com.autowash.entity.RefreshToken;
import com.autowash.enums.UserStatus;
import com.autowash.repository.AuthUserRepository;
import com.autowash.repository.GoogleAuthTicketRepository;
import com.autowash.repository.RefreshTokenRepository;
import com.autowash.shared.exception.ApiException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);

    private final AuthUserRepository authUserRepository;
    private final GoogleAuthTicketRepository ticketRepository;
    private final GoogleOAuthClient googleOAuthClient;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshTokenExpirationSeconds;
    private final long ticketTtlSeconds;
    private final String frontendBaseUrl;

    public GoogleAuthService(
            AuthUserRepository authUserRepository,
            GoogleAuthTicketRepository ticketRepository,
            GoogleOAuthClient googleOAuthClient,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            RefreshTokenRepository refreshTokenRepository,
            @Value("${autowash.auth.jwt.refresh-token-expiration-seconds:2592000}") long refreshTokenExpirationSeconds,
            @Value("${autowash.auth.google.ticket-ttl-seconds:300}") long ticketTtlSeconds,
            @Value("${autowash.auth.google.frontend-base-url:http://localhost:3000}") String frontendBaseUrl
    ) {
        this.authUserRepository = authUserRepository;
        this.ticketRepository = ticketRepository;
        this.googleOAuthClient = googleOAuthClient;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenExpirationSeconds = refreshTokenExpirationSeconds;
        this.ticketTtlSeconds = ticketTtlSeconds;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public String start(String returnUrl) {
        String resolvedReturnUrl = normalizeReturnUrl(returnUrl);
        String state = UUID.randomUUID().toString();
        GoogleAuthTicket ticket = new GoogleAuthTicket(state, resolvedReturnUrl, Instant.now().plusSeconds(ticketTtlSeconds));
        ticketRepository.save(ticket);
        return googleOAuthClient.buildAuthorizationUrl(state, resolvedReturnUrl);
    }

    @Transactional
    public String handleCallback(String code, String state, String error, String errorDescription) {
        GoogleAuthTicket ticket;
        try {
            ticket = loadActiveTicket(state);
        } catch (ApiException exception) {
            return buildFallbackFrontendErrorRedirect(resolveTicketErrorMessage(exception));
        }
        if (error != null && !error.isBlank()) {
            return buildFrontendErrorRedirect(ticket.getReturnUrl(), ticket.getState(), resolveProviderError(error, errorDescription));
        }
        if (code == null || code.isBlank()) {
            return buildFrontendErrorRedirect(ticket.getReturnUrl(), ticket.getState(), "Google login did not return an authorization code.");
        }
        try {
            GoogleOAuthUserInfo profile = googleOAuthClient.exchangeCode(code);
            if (!profile.emailVerified()) {
                return buildFrontendErrorRedirect(ticket.getReturnUrl(), ticket.getState(), "Google email is not verified.");
            }

            Optional<AuthUser> providerUser = authUserRepository.findByOauthSubject(profile.subject());
            if (providerUser.isPresent()) {
                AuthUser user = providerUser.get();
                if (user.getStatus() == UserStatus.BLOCKED) {
                    throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Account blocked", "ACCOUNT_BLOCKED");
                }
                if (user.getStatus() == UserStatus.SUSPENDED) {
                    throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Account suspended", "ACCOUNT_SUSPENDED");
                }
                ticket.markReady(profile.subject(), profile.email(), profile.fullName(), profile.avatarUrl(), user);
                ticketRepository.save(ticket);
                return buildFrontendRedirect(ticket.getReturnUrl(), ticket.getState(), "ready");
            }

            Optional<AuthUser> existingByEmail = authUserRepository.findByEmailIgnoreCase(profile.email());
            if (existingByEmail.isPresent()) {
                AuthUser user = existingByEmail.get();
                if (user.getStatus() == UserStatus.BLOCKED) {
                    throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Account blocked", "ACCOUNT_BLOCKED");
                }
                if (user.getStatus() == UserStatus.SUSPENDED) {
                    throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Account suspended", "ACCOUNT_SUSPENDED");
                }
                ticket.markLinkRequired(profile.subject(), profile.email(), profile.fullName(), profile.avatarUrl(), user);
                ticketRepository.save(ticket);
                return buildFrontendRedirect(ticket.getReturnUrl(), ticket.getState(), "link-required");
            }

            AuthUser user = createGoogleUser(profile);
            user = authUserRepository.save(user);
            ticket.markReady(profile.subject(), profile.email(), profile.fullName(), profile.avatarUrl(), user);
            ticketRepository.save(ticket);
            return buildFrontendRedirect(ticket.getReturnUrl(), ticket.getState(), "ready");
        } catch (ApiException exception) {
            log.warn("Google OAuth callback business failure for state {}", ticket.getState(), exception);
            return buildFrontendErrorRedirect(ticket.getReturnUrl(), ticket.getState(), exception.getMessage());
        } catch (Exception exception) {
            log.error("Google OAuth callback failed for state {}", ticket.getState(), exception);
            return buildFrontendErrorRedirect(ticket.getReturnUrl(), ticket.getState(), "Google login failed. Please try again.");
        }
    }

    @Transactional(readOnly = true)
    public GoogleAuthTicketResponse getTicket(String state) {
        GoogleAuthTicket ticket = loadTicket(state);
        return new GoogleAuthTicketResponse(
                ticket.getState(),
                ticket.getStatus().name(),
                ticket.getProviderEmail(),
                ticket.getProviderFullName(),
                ticket.getProviderAvatarUrl(),
                ticket.getReturnUrl(),
                ticket.getUser() == null ? null : ticket.getUser().getId().toString(),
                ticket.getStatus() == GoogleAuthTicketStatus.LINK_REQUIRED,
                ticket.isExpired()
        );
    }

    @Transactional
    public LoginResponse exchangeReadyTicket(String state) {
        GoogleAuthTicket ticket = loadActiveTicket(state);
        if (ticket.getStatus() != GoogleAuthTicketStatus.READY || ticket.getUser() == null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Google ticket is not ready", "TICKET_NOT_READY");
        }

        AuthUser user = ticket.getUser();
        ticket.consume();
        ticketRepository.save(ticket);
        return toLoginResponse(user);
    }

    @Transactional
    public LoginResponse confirmLink(String state) {
        GoogleAuthTicket ticket = loadActiveTicket(state);
        if (ticket.getStatus() != GoogleAuthTicketStatus.LINK_REQUIRED || ticket.getUser() == null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Google ticket is not linkable", "TICKET_NOT_LINKABLE");
        }

        AuthUser user = ticket.getUser();
        user.linkGoogleAccount(ticket.getProviderSubject(), ticket.getProviderEmail(), ticket.getProviderAvatarUrl());
        authUserRepository.save(user);

        ticket.markReady(ticket.getProviderSubject(), ticket.getProviderEmail(), ticket.getProviderFullName(), ticket.getProviderAvatarUrl(), user);
        ticketRepository.save(ticket);
        return toLoginResponse(user);
    }

    private AuthUser createGoogleUser(GoogleOAuthUserInfo profile) {
        String placeholderPhone = generatePlaceholderPhone(profile.subject());
        String passwordHash = passwordEncoder.encode(UUID.randomUUID().toString());
        return AuthUser.createGoogleCustomer(
                profile.fullName(),
                placeholderPhone,
                profile.email(),
                profile.subject(),
                profile.avatarUrl(),
                passwordHash
        );
    }

    private LoginResponse toLoginResponse(AuthUser user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user).getToken();

        return new LoginResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getTier().name(),
                0,
                user.isNewCustomer(),
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpirationSeconds()
        );
    }

    private GoogleAuthTicket loadTicket(String state) {
        return ticketRepository.findByState(state)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Google ticket not found", "RESOURCE_NOT_FOUND"));
    }

    private GoogleAuthTicket loadActiveTicket(String state) {
        GoogleAuthTicket ticket = loadTicket(state);
        if (ticket.isExpired()) {
            ticket.expire();
            ticketRepository.save(ticket);
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Google ticket expired", "TICKET_EXPIRED");
        }
        if (ticket.isConsumed()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Google ticket already consumed", "TICKET_CONSUMED");
        }
        return ticket;
    }

    private String normalizeReturnUrl(String returnUrl) {
        if (returnUrl == null || returnUrl.isBlank()) {
            return buildDefaultReturnUrl();
        }
        return returnUrl;
    }

    private String buildDefaultReturnUrl() {
        return org.springframework.web.util.UriComponentsBuilder.fromUriString(frontendBaseUrl)
                .path("/auth/google/callback")
                .toUriString();
    }

    private String buildFrontendRedirect(String returnUrl, String state, String status) {
        return UriBuilderSupport.appendQueryParams(returnUrl, state, status);
    }

    private String buildFrontendErrorRedirect(String returnUrl, String state, String errorMessage) {
        return UriBuilderSupport.appendErrorQueryParams(returnUrl, state, errorMessage);
    }

    private String buildFallbackFrontendErrorRedirect(String errorMessage) {
        return UriBuilderSupport.appendErrorQueryParams(buildDefaultReturnUrl(), null, errorMessage);
    }

    private String resolveProviderError(String error, String errorDescription) {
        if (errorDescription != null && !errorDescription.isBlank()) {
            return errorDescription;
        }
        return switch (error) {
            case "access_denied" -> "Google login was cancelled.";
            default -> "Google login failed.";
        };
    }

    private String resolveTicketErrorMessage(ApiException exception) {
        return switch (exception.getErrorCode()) {
            case "RESOURCE_NOT_FOUND", "TICKET_EXPIRED", "TICKET_CONSUMED" -> "Google login session expired. Please try again.";
            default -> "Google login failed.";
        };
    }

    private String generatePlaceholderPhone(String subject) {
        byte[] digest;
        try {
            digest = MessageDigest.getInstance("SHA-256").digest(subject.getBytes());
        } catch (Exception exception) {
            digest = subject.getBytes();
        }
        String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        String digits = encoded.replaceAll("[^0-9]", "");
        String fallback = String.format("%010d", Math.abs(subject.hashCode()) % 1_000_000_000L);
        String raw = (digits + fallback).replaceAll("\\D", "");
        String phone = raw.length() >= 10 ? raw.substring(0, 10) : fallback;
        if (!phone.startsWith("0")) {
            phone = "0" + phone.substring(1);
        }
        return phone.substring(0, 10);
    }

    private static final class UriBuilderSupport {
        private static String appendQueryParams(String returnUrl, String state, String status) {
            return org.springframework.web.util.UriComponentsBuilder.fromUriString(returnUrl)
                    .queryParam("state", state)
                    .queryParam("status", status)
                    .build(false)
                    .encode()
                    .toUriString();
        }

        private static String appendErrorQueryParams(String returnUrl, String state, String errorMessage) {
            org.springframework.web.util.UriComponentsBuilder builder = org.springframework.web.util.UriComponentsBuilder.fromUriString(returnUrl)
                    .queryParam("status", "error")
                    .queryParam("error", errorMessage);
            if (state != null && !state.isBlank()) {
                builder.queryParam("state", state);
            }
            return builder.build(false).encode().toUriString();
        }
    }

    private RefreshToken createRefreshToken(AuthUser user) {
        RefreshToken refreshToken = new RefreshToken(
                user,
                UUID.randomUUID().toString(),
                Instant.now().plusSeconds(refreshTokenExpirationSeconds)
        );
        return refreshTokenRepository.save(refreshToken);
    }
}
