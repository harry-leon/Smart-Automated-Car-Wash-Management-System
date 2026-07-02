package com.autowash.service.impl;

import com.autowash.dto.CustomerVoucherResponse;
import com.autowash.entity.LoyaltyAccount;
import com.autowash.entity.User;
import com.autowash.entity.Voucher;
import com.autowash.entity.VoucherTier;
import com.autowash.entity.enums.ActiveStatus;
import com.autowash.entity.enums.LoyaltyTier;
import com.autowash.repository.LoyaltyAccountRepository;
import com.autowash.repository.VoucherRepository;
import com.autowash.repository.VoucherTierRepository;
import com.autowash.service.CurrentUserService;
import com.autowash.service.CustomerVoucherService;
import com.autowash.shared.dto.PaginationMeta;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerVoucherServiceImpl implements CustomerVoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherTierRepository voucherTierRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final CurrentUserService currentUserService;

    public CustomerVoucherServiceImpl(
            VoucherRepository voucherRepository,
            VoucherTierRepository voucherTierRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            CurrentUserService currentUserService
    ) {
        this.voucherRepository = voucherRepository;
        this.voucherTierRepository = voucherTierRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public VoucherPage listActiveVouchers(int page, int limit) {
        User user = currentUserService.getCurrentUser();
        Page<Voucher> vouchers = voucherRepository.findActiveForTier(
                Instant.now(),
                tierFor(user),
                ActiveStatus.ACTIVE,
                PageRequest.of(Math.max(page - 1, 0), limit)
        );

        List<CustomerVoucherResponse> items = vouchers.getContent().stream()
                .map(this::toResponse)
                .toList();

        PaginationMeta pagination = new PaginationMeta(
                vouchers.getNumber() + 1,
                vouchers.getSize(),
                vouchers.getTotalElements(),
                vouchers.getTotalPages(),
                vouchers.hasNext()
        );

        return new VoucherPage(items, pagination);
    }

    private LoyaltyTier tierFor(User user) {
        return loyaltyAccountRepository.findByCustomerId(user.getId())
                .map(LoyaltyAccount::getTier)
                .orElse(LoyaltyTier.BRONZE);
    }

    private CustomerVoucherResponse toResponse(Voucher voucher) {
        List<String> targetTiers = voucherTierRepository.findByVoucherId(voucher.getId()).stream()
                .map(VoucherTier::getTier)
                .map(Enum::name)
                .toList();

        return new CustomerVoucherResponse(
                voucher.getCode(),
                voucher.getName(),
                voucher.getDiscountType().name(),
                Math.toIntExact(voucher.getDiscountValue()),
                voucher.getMinOrderAmount(),
                voucher.getMaxDiscountAmount(),
                voucher.getEndAt(),
                targetTiers
        );
    }
}
