package com.autowash.service;

import com.autowash.dto.GoogleAuthTicketResponse;
import com.autowash.dto.LoginResponse;

public interface GoogleOAuthService {

    /**
     * Step 1 — Build the Google authorization URL and persist a PENDING ticket.
     * Returns the Google consent-screen URL to redirect the browser to.
     */
    String buildAuthorizationUrl(String returnUrl);

    /**
     * Step 2 — Called by the backend after Google redirects back.
     * Exchanges the code for Google user info, then updates the ticket:
     *   - READY          → brand-new user or returning Google-linked user
     *   - LINK_REQUIRED  → Google email matches an existing local account
     * Finally redirects the browser back to returnUrl?state=...
     */
    String handleCallback(String code, String state);

    /**
     * Step 3a — Frontend polls this to know when the ticket is ready.
     * Returns ticket status + provider profile for display.
     */
    GoogleAuthTicketResponse getTicket(String state);

    /**
     * Step 3b — Exchange a READY ticket for a JWT (new or returning Google user).
     */
    LoginResponse exchangeTicket(String state);

    /**
     * Step 3c — Confirm linking a Google account to an existing local account.
     * Called when ticket status is LINK_REQUIRED and the user confirms.
     */
    LoginResponse confirmLink(String state);
}
