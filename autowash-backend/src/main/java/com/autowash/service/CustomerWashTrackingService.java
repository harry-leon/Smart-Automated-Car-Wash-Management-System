package com.autowash.service;

import com.autowash.dto.CustomerWashTrackingResponse;
import java.util.UUID;

public interface CustomerWashTrackingService {
    CustomerWashTrackingResponse getActiveSession();
    CustomerWashTrackingResponse getSession(UUID washSessionId);
}

