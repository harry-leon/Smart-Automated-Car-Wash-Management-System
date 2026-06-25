package com.autowash.shared.security;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.autowash.service.JwtService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

class JwtAuthenticationFilterTest {

    @Test
    void continuesWithoutAuthenticationWhenTokenSubjectUserNoLongerExists() throws Exception {
        JwtService jwtService = Mockito.mock(JwtService.class);
        AuthUserDetailsService authUserDetailsService = Mockito.mock(AuthUserDetailsService.class);
        FilterChain filterChain = Mockito.mock(FilterChain.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, authUserDetailsService);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer stale-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.isValid("stale-token")).thenReturn(true);
        when(jwtService.extractSubject("stale-token")).thenReturn("missing-user-id");
        doThrow(new UsernameNotFoundException("User not found"))
                .when(authUserDetailsService)
                .loadUserByUsername("missing-user-id");

        try {
            filter.doFilter(request, response, filterChain);
            verify(filterChain).doFilter(request, response);
            verify(authUserDetailsService).loadUserByUsername("missing-user-id");
            org.junit.jupiter.api.Assertions.assertNull(SecurityContextHolder.getContext().getAuthentication());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
