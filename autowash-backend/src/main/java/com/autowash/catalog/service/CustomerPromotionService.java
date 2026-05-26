package com.autowash.catalog.service;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.LoyaltyTier;
import com.autowash.catalog.dto.CustomerPromotionResponse;
import com.autowash.catalog.entity.Voucher;
import com.autowash.catalog.repository.VoucherRepository;
import com.autowash.user.service.CurrentUserService;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerPromotionService {

    private static final List<String> ALL_TIERS = List.of("MEMBER", "SILVER", "GOLD", "PLATINUM");

    private final VoucherRepository voucherRepository;
    private final CurrentUserService currentUserService;

    public CustomerPromotionService(VoucherRepository voucherRepository, CurrentUserService currentUserService) {
        this.voucherRepository = voucherRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<CustomerPromotionResponse> listActivePromotions() {
        AuthUser user = currentUserService.getCurrentUser();
        return voucherRepository.findByActiveTrueAndExpiresAtAfterOrderByExpiresAtAsc(Instant.now()).stream()
                .filter(voucher -> appliesToCustomer(voucher, user))
                .map(this::toPromotion)
                .toList();
    }

    private boolean appliesToCustomer(Voucher voucher, AuthUser user) {
        if (voucher.isNewCustomerOnly() && !user.isNewCustomer()) {
            return false;
        }
        List<String> targetTiers = resolveTargetTiers(voucher);
        return targetTiers.contains(user.getTier().name());
    }

    private CustomerPromotionResponse toPromotion(Voucher voucher) {
        List<String> targetTiers = resolveTargetTiers(voucher);
        return new CustomerPromotionResponse(
                voucher.getCode(),
                buildTitle(voucher),
                inferPromotionType(voucher, targetTiers),
                targetTiers,
                voucher.getDiscountType().name(),
                voucher.getDiscountValue(),
                voucher.getMinAmount(),
                voucher.isNewCustomerOnly(),
                voucher.getExpiresAt()
        );
    }

    private List<String> resolveTargetTiers(Voucher voucher) {
        if (voucher.getTargetTiersCsv() == null || voucher.getTargetTiersCsv().isBlank()) {
            return ALL_TIERS;
        }
        return Arrays.stream(voucher.getTargetTiersCsv().split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private String inferPromotionType(Voucher voucher, List<String> targetTiers) {
        if (voucher.isNewCustomerOnly()) {
            return "NEW_CUSTOMERS";
        }
        if (targetTiers.size() == ALL_TIERS.size()) {
            return "ALL_MEMBERS";
        }
        return "SELECTED_TIERS";
    }

    private String buildTitle(Voucher voucher) {
        if (voucher.getDiscountType().name().equals("PERCENT")) {
            return voucher.getCode() + " - " + voucher.getDiscountValue() + "% off";
        }
        return voucher.getCode() + " - " + voucher.getDiscountValue() + " VND off";
    }
}
