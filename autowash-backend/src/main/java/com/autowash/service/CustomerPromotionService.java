package com.autowash.service;

import com.autowash.dto.CustomerPromotionResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerPromotionService {

    private final PromotionService promotionService;

    public CustomerPromotionService(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @Transactional(readOnly = true)
    public List<CustomerPromotionResponse> listActivePromotions() {
        return promotionService.listActiveLegacyForCurrentCustomer();
    }
}
