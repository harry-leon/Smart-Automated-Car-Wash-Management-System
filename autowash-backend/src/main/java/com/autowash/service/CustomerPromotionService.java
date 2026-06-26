package com.autowash.service;

import com.autowash.dto.CustomerPromotionResponse;
import java.util.List;

public interface CustomerPromotionService {
    List<CustomerPromotionResponse> listActivePromotions();
}
