package com.autowash.auth.service;

import com.autowash.auth.dto.GoogleOAuthUserInfo;

public interface GoogleOAuthClient {
    String buildAuthorizationUrl(String state, String returnUrl);

    GoogleOAuthUserInfo exchangeCode(String code);
}
