package com.autowash.entity;

import com.autowash.entity.enums.GoogleAuthTicketStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "google_auth_tickets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GoogleAuthTicket {

    /** Opaque random state string — also serves as the primary key. */
    @Id
    @Column(name = "state", length = 255)
    private String state;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private GoogleAuthTicketStatus status;

    @Column(name = "provider_email", length = 255)
    private String providerEmail;

    @Column(name = "provider_full_name", length = 150)
    private String providerFullName;

    @Column(name = "provider_avatar_url", length = 500)
    private String providerAvatarUrl;

    /** Google sub (subject) — stable unique ID for the Google account. */
    @Column(name = "provider_subject", length = 255)
    private String providerSubject;

    /** Frontend URL to redirect back to after the flow completes. */
    @Column(name = "return_url", nullable = false, length = 1000)
    private String returnUrl;

    /**
     * Set when an existing local account matches the Google email.
     * Null for brand-new users.
     */
    @Column(name = "user_id")
    private UUID userId;

    /** True when the Google email matches an existing local account — user must confirm linking. */
    @Column(name = "link_required", nullable = false)
    private boolean linkRequired;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public GoogleAuthTicket(String state, String returnUrl, Instant expiresAt) {
        this.state = state;
        this.status = GoogleAuthTicketStatus.PENDING;
        this.returnUrl = returnUrl;
        this.expiresAt = expiresAt;
        this.linkRequired = false;
        this.createdAt = Instant.now();
    }

    /** Called by the backend callback after Google redirects back with code + profile. */
    public void markReady(String providerSubject, String providerEmail,
                          String providerFullName, String providerAvatarUrl) {
        this.providerSubject = providerSubject;
        this.providerEmail = providerEmail;
        this.providerFullName = providerFullName;
        this.providerAvatarUrl = providerAvatarUrl;
        this.status = GoogleAuthTicketStatus.READY;
        this.linkRequired = false;
        this.userId = null;
    }

    /** Called when Google email matches an existing account — user must confirm. */
    public void markLinkRequired(String providerSubject, String providerEmail,
                                  String providerFullName, String providerAvatarUrl, UUID existingUserId) {
        this.providerSubject = providerSubject;
        this.providerEmail = providerEmail;
        this.providerFullName = providerFullName;
        this.providerAvatarUrl = providerAvatarUrl;
        this.status = GoogleAuthTicketStatus.LINK_REQUIRED;
        this.linkRequired = true;
        this.userId = existingUserId;
    }

    public void markConsumed() {
        this.status = GoogleAuthTicketStatus.CONSUMED;
    }

    public void markExpired() {
        this.status = GoogleAuthTicketStatus.EXPIRED;
    }

    public boolean isExpired() {
        return expiresAt.isBefore(Instant.now()) || status == GoogleAuthTicketStatus.EXPIRED;
    }
}
