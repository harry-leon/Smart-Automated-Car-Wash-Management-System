package com.autowash.shared.security;

import com.autowash.entity.User;
import com.autowash.service.JwtService;
import jakarta.servlet.FilterChain;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

class JwtAuthenticationFilterTest {

    @Test
    void continuesWithoutAuthenticationWhenTokenSubjectUserNoLongerExists() throws Exception {
        JwtService jwtService = new JwtService() {
            @Override
            public String generateAccessToken(User user) {
                return "unused";
            }

            @Override
            public String extractSubject(String token) {
                return "missing-user-id";
            }

            @Override
            public boolean isValid(String token) {
                return true;
            }

            @Override
            public long getAccessTokenExpirationSeconds() {
                return 0;
            }
        };
        AtomicReference<String> loadedUsername = new AtomicReference<>();
        AuthUserDetailsService authUserDetailsService = new AuthUserDetailsService(null) {
            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                loadedUsername.set(username);
                throw new UsernameNotFoundException("User not found");
            }
        };
        AtomicBoolean filterChainCalled = new AtomicBoolean(false);
        FilterChain filterChain = (request, response) -> filterChainCalled.set(true);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, authUserDetailsService);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer stale-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        try {
            filter.doFilter(request, response, filterChain);
            org.junit.jupiter.api.Assertions.assertTrue(filterChainCalled.get());
            org.junit.jupiter.api.Assertions.assertEquals("missing-user-id", loadedUsername.get());
            org.junit.jupiter.api.Assertions.assertNull(SecurityContextHolder.getContext().getAuthentication());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
