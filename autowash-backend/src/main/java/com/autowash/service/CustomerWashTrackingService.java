package com.autowash.service;

import com.autowash.dto.CustomerWashTrackingResponse;
import com.autowash.dto.WashCompletionSummaryResponse;
import java.util.UUID;

public interface CustomerWashTrackingService {
    CustomerWashTrackingResponse getActiveSession();
    CustomerWashTrackingResponse getSession(UUID washSessionId);
    WashCompletionSummaryResponse getCompletionSummary(UUID washSessionId);
}

