package com.autowash.service;

import com.autowash.dto.AdminVoucherRedemptionResponse;
import com.autowash.dto.AdminVoucherResponse;
import com.autowash.entity.Voucher;
import com.autowash.repository.VoucherRepository;
import com.autowash.entity.PointTransaction;
import com.autowash.entity.enums.PointTransactionType;
import com.autowash.repository.PointTransactionRepository;
import com.autowash.shared.dto.PaginationMeta;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminVoucherService {

    private final VoucherRepository voucherRepository;
    private final PointTransactionRepository pointTransactionRepository;

    public AdminVoucherService(
            VoucherRepository voucherRepository,
            PointTransactionRepository pointTransactionRepository
    ) {
        this.voucherRepository = voucherRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminVoucherResponse> listVouchers() {
        return voucherRepository.findAll(Sort.by(Sort.Order.desc("active"), Sort.Order.asc("expiresAt"))).stream()
                .map(this::toVoucherResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RedemptionPage listRedemptions(String searchQuery, Instant dateFrom, Instant dateTo, int page, int limit) {
        String normalizedSearch = normalizeSearch(searchQuery);
        Page<PointTransaction> transactions = pointTransactionRepository.searchAdminByType(
                PointTransactionType.REDEEM,
                normalizedSearch,
                dateFrom,
                dateTo,
                PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("createdAt").descending())
        );
        List<AdminVoucherRedemptionResponse> items = transactions.getContent().stream()
                .map(this::toRedemptionResponse)
                .toList();
        return new RedemptionPage(
                items,
                new PaginationMeta(
                        transactions.getNumber() + 1,
                        transactions.getSize(),
                        transactions.getTotalElements(),
                        transactions.getTotalPages(),
                        transactions.hasNext()
                )
        );
    }

    private String normalizeSearch(String searchQuery) {
        if (searchQuery == null || searchQuery.isBlank()) {
            return null;
        }
        return "%" + searchQuery.trim().toLowerCase() + "%";
    }

    private AdminVoucherResponse toVoucherResponse(Voucher voucher) {
        return new AdminVoucherResponse(
                voucher.getCode(),
                voucher.getDiscountType().name(),
                Math.toIntExact(voucher.getDiscountValue()),
                voucher.getMinOrderAmount(),
                voucher.getEndAt(),
                voucher.getStatus() == com.autowash.entity.enums.ActiveStatus.ACTIVE,
                voucher.isNewCustomerOnly(),
                parseTargetTiers("")
        );
    }

    private List<String> parseTargetTiers(String targetTiersCsv) {
        if (targetTiersCsv == null || targetTiersCsv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(targetTiersCsv.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private AdminVoucherRedemptionResponse toRedemptionResponse(PointTransaction transaction) {
        com.autowash.entity.User customer = transaction.getLoyaltyAccount().getCustomer();
        return new AdminVoucherRedemptionResponse(
                transaction.getId().toString(),
                customer.getId(),
                customer.getFullName(),
                customer.getPhone(),
                transaction.getBooking() != null ? transaction.getBooking().getId().toString() : null,
                Math.abs(transaction.getPoints()),
                transaction.getBalanceAfter(),
                transaction.getCreatedAt()
        );
    }

    public record RedemptionPage(List<AdminVoucherRedemptionResponse> items, PaginationMeta pagination) {
    }
}

