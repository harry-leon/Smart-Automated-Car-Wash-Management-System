package com.autowash.service;

import com.autowash.dto.AddonResponse;
import com.autowash.dto.ComboResponse;
import com.autowash.dto.PackageResponse;
import com.autowash.dto.ValidateVoucherResponse;
import com.autowash.entity.enums.DiscountType;
import com.autowash.entity.enums.ActiveStatus;
import com.autowash.entity.Combo;
import com.autowash.entity.Package;
import com.autowash.entity.Voucher;
import com.autowash.repository.ServiceRepository;
import com.autowash.repository.ComboRepository;
import com.autowash.repository.PackageRepository;
import com.autowash.repository.VoucherRepository;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import com.autowash.service.CurrentUserService;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CatalogService {

    private final PackageRepository PackageRepository;
    private final ServiceRepository serviceRepository;
    private final ComboRepository ComboRepository;
    private final VoucherRepository voucherRepository;
    private final CurrentUserService currentUserService;

    public CatalogService(
            PackageRepository PackageRepository,
            ServiceRepository serviceRepository,
            ComboRepository ComboRepository,
            VoucherRepository voucherRepository,
            CurrentUserService currentUserService
    ) {
        this.PackageRepository = PackageRepository;
        this.serviceRepository = serviceRepository;
        this.ComboRepository = ComboRepository;
        this.voucherRepository = voucherRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public PackagePage getPackages(int page, int limit) {
        Page<Package> packages = PackageRepository.findByStatusOrderByIdAsc(
                ActiveStatus.ACTIVE,
                PageRequest.of(Math.max(page - 1, 0), limit)
        );
        List<PackageResponse> items = packages.getContent().stream().map(this::toPackageResponse).toList();
        PaginationMeta pagination = new PaginationMeta(
                packages.getNumber() + 1,
                packages.getSize(),
                packages.getTotalElements(),
                packages.getTotalPages(),
                packages.hasNext()
        );
        return new PackagePage(items, pagination);
    }

    @Transactional(readOnly = true)
    public List<AddonResponse> getAddons() {
        return serviceRepository.findByStatusOrderByIdAsc(ActiveStatus.ACTIVE).stream()
                .map(this::toAddonResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComboResponse> getAvailableCombos() {
        return ComboRepository.findByActiveTrueOrderByIdAsc().stream()
                .map(this::toComboResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ValidateVoucherResponse validateVoucher(String voucherCode, long amount) {
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> businessRule("VOUCHER_NOT_FOUND", "Voucher not found", "USE_DIFFERENT_VOUCHER"));
        validateVoucherOrThrow(voucher, amount);
        long discountAmount = calculateDiscountAmount(voucher, amount);
        return new ValidateVoucherResponse(
                voucher.getCode(),
                true,
                voucher.getDiscountType().name(),
                Math.toIntExact(voucher.getDiscountValue()),
                discountAmount,
                Math.max(amount - discountAmount, 0),
                voucher.getEndAt()
        );
    }

    @Transactional(readOnly = true)
    public Package requireActivePackage(String packageId) {
        return PackageRepository.findById(java.util.UUID.fromString(packageId))
                .filter(pkg -> pkg.getStatus() == ActiveStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Package is not available", "BUSINESS_RULE_VIOLATION"));
    }

    @Transactional(readOnly = true)
    public Combo requireActiveCombo(String comboId) {
        return ComboRepository.findByIdAndActiveTrue(comboId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Combo is not available", "BUSINESS_RULE_VIOLATION"));
    }

    @Transactional(readOnly = true)
    public List<com.autowash.entity.Service> requireActiveAddons(List<String> addonIds) {
        if (addonIds == null || addonIds.isEmpty()) {
            return List.of();
        }
        return addonIds.stream()
                .map(id -> serviceRepository.findByIdAndStatus(java.util.UUID.fromString(id), ActiveStatus.ACTIVE)
                        .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Add-on is not available", "BUSINESS_RULE_VIOLATION")))
                .toList();
    }

    @Transactional(readOnly = true)
    public Voucher validateVoucherForBooking(String voucherCode, long amount) {
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> businessRule("VOUCHER_NOT_FOUND", "Voucher not found", "USE_DIFFERENT_VOUCHER"));
        validateVoucherOrThrow(voucher, amount);
        return voucher;
    }

    public long calculateDiscountAmount(Voucher voucher, long amount) {
        if (voucher.getDiscountType() == DiscountType.PERCENT) {
            return amount * voucher.getDiscountValue() / 100;
        }
        return Math.min(voucher.getDiscountValue(), amount);
    }

    private void validateVoucherOrThrow(Voucher voucher, long amount) {
        if (voucher.getStatus() != com.autowash.entity.enums.ActiveStatus.ACTIVE) {
            throw businessRule("VOUCHER_NOT_FOUND", "Voucher not found", "USE_DIFFERENT_VOUCHER");
        }
        if (voucher.getEndAt().isBefore(Instant.now())) {
            throw businessRule("VOUCHER_EXPIRED", "This voucher has expired", "USE_DIFFERENT_VOUCHER");
        }
        if (amount < voucher.getMinOrderAmount()) {
            throw businessRule("AMOUNT_TOO_LOW", "Booking amount is below minimum for this voucher", "INCREASE_ORDER_VALUE");
        }
        if (voucher.isNewCustomerOnly() && !currentUserService.getCurrentUser().isNewCustomer()) {
            throw businessRule("NEW_CUSTOMER_ONLY", "This voucher is for new customers only", "USE_DIFFERENT_VOUCHER");
        }
    }

    private ApiException businessRule(String code, String message, String action) {
        return new ApiException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Voucher validation failed",
                "BUSINESS_RULE_VIOLATION",
                Map.of("code", code, "message", message, "action", action)
        );
    }

    private PackageResponse toPackageResponse(Package Package) {
        return new PackageResponse(
                Package.getId().toString(),
                Package.getName(),
                Package.getDescription(),
                Package.getBasePrice(),
                Package.getDurationMinutes(),
                null,
                List.of(),
                Package.getImageUrl(),
                Package.getStatus().name(),
                null
        );
    }

    private AddonResponse toAddonResponse(com.autowash.entity.Service addon) {
        return new AddonResponse(
                addon.getId().toString(),
                addon.getName(),
                addon.getDescription(),
                addon.getPrice(),
                addon.getDurationMinutes(),
                null,
                null,
                List.of(),
                addon.getStatus().name()
        );
    }

    private ComboResponse toComboResponse(Combo combo) {
        return new ComboResponse(
                combo.getId().toString(),
                combo.getName(),
                combo.getDescription(),
                combo.getPrice(),
                combo.getDurationDays() == null ? 0 : combo.getDurationDays(),
                combo.getMaxUsages() == null ? 0 : combo.getMaxUsages(),
                List.of(),
                combo.getImageUrl(),
                combo.getStatus() == ActiveStatus.ACTIVE,
                false,
                0L
        );
    }

    public record PackagePage(List<PackageResponse> items, PaginationMeta pagination) {
    }
}

