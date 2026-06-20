package com.autowash.entity;

import com.autowash.entity.enums.GoogleAuthTicketStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_google_tickets")
public class GoogleAuthTicket {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String state;

    @Column(name = "return_url", nullable = false, length = 500)
    private String returnUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GoogleAuthTicketStatus status;

    @Column(name = "provider_subject", length = 255)
    private String providerSubject;

    @Column(name = "provider_email", length = 255)
    private String providerEmail;

    @Column(name = "provider_full_name", length = 100)
    private String providerFullName;

    @Column(name = "provider_avatar_url", length = 500)
    private String providerAvatarUrl;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AuthUser user;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GoogleAuthTicket() {
    }

    public GoogleAuthTicket(String state, String returnUrl, Instant expiresAt) {
        this.id = UUID.randomUUID();
        this.state = state;
        this.returnUrl = returnUrl;
        this.status = GoogleAuthTicketStatus.PENDING;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getState() {
        return state;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public GoogleAuthTicketStatus getStatus() {
        return status;
    }

    public String getProviderSubject() {
        return providerSubject;
    }

    public String getProviderEmail() {
        return providerEmail;
    }

    public String getProviderFullName() {
        return providerFullName;
    }

    public String getProviderAvatarUrl() {
        return providerAvatarUrl;
    }

    public AuthUser getUser() {
        return user;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isExpired() {
        return expiresAt.isBefore(Instant.now());
    }

    public boolean isConsumed() {
        return consumedAt != null || status == GoogleAuthTicketStatus.CONSUMED;
    }

    public void markLinkRequired(String subject, String email, String fullName, String avatarUrl, AuthUser user) {
        this.status = GoogleAuthTicketStatus.LINK_REQUIRED;
        this.providerSubject = subject;
        this.providerEmail = email;
        this.providerFullName = fullName;
        this.providerAvatarUrl = avatarUrl;
        this.user = user;
        this.updatedAt = Instant.now();
    }

    public void markReady(String subject, String email, String fullName, String avatarUrl, AuthUser user) {
        this.status = GoogleAuthTicketStatus.READY;
        this.providerSubject = subject;
        this.providerEmail = email;
        this.providerFullName = fullName;
        this.providerAvatarUrl = avatarUrl;
        this.user = user;
        this.updatedAt = Instant.now();
    }

    public void consume() {
        this.status = GoogleAuthTicketStatus.CONSUMED;
        this.consumedAt = Instant.now();
        this.updatedAt = this.consumedAt;
    }

    public void expire() {
        this.status = GoogleAuthTicketStatus.EXPIRED;
        this.updatedAt = Instant.now();
    }
}
