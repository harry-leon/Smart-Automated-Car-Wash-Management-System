package com.autowash.service.impl;

import com.autowash.dto.CustomerPromotionResponse;
import com.autowash.service.CustomerPromotionService;
import com.autowash.service.PromotionService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerPromotionServiceImpl implements CustomerPromotionService {

    private final PromotionService promotionService;

    public CustomerPromotionServiceImpl(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @Transactional(readOnly = true)
    public List<CustomerPromotionResponse> listActivePromotions() {
        return promotionService.listActiveLegacyForCurrentCustomer();
    }
}
