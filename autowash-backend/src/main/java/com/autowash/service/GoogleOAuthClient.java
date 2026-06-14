package com.autowash.service;

import com.autowash.dto.GoogleOAuthUserInfo;

public interface GoogleOAuthClient {
    String buildAuthorizationUrl(String state, String returnUrl);

    GoogleOAuthUserInfo exchangeCode(String code);
}
