package com.autowash.service;

import com.autowash.dto.AddonResponse;
import com.autowash.dto.ComboResponse;
import com.autowash.dto.PackageResponse;
import com.autowash.dto.ValidateVoucherResponse;
import com.autowash.entity.DiscountType;
import com.autowash.entity.PackageStatus;
import com.autowash.entity.ServiceAddon;
import com.autowash.entity.ServiceCombo;
import com.autowash.entity.ServicePackage;
import com.autowash.entity.Voucher;
import com.autowash.repository.ServiceAddonRepository;
import com.autowash.repository.ServiceComboRepository;
import com.autowash.repository.ServicePackageRepository;
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

@Service
public class CatalogService {

    private final ServicePackageRepository servicePackageRepository;
    private final ServiceAddonRepository serviceAddonRepository;
    private final ServiceComboRepository serviceComboRepository;
    private final VoucherRepository voucherRepository;
    private final CurrentUserService currentUserService;

    public CatalogService(
            ServicePackageRepository servicePackageRepository,
            ServiceAddonRepository serviceAddonRepository,
            ServiceComboRepository serviceComboRepository,
            VoucherRepository voucherRepository,
            CurrentUserService currentUserService
    ) {
        this.servicePackageRepository = servicePackageRepository;
        this.serviceAddonRepository = serviceAddonRepository;
        this.serviceComboRepository = serviceComboRepository;
        this.voucherRepository = voucherRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public PackagePage getPackages(int page, int limit) {
        Page<ServicePackage> packages = servicePackageRepository.findByStatusOrderByIdAsc(
                PackageStatus.ACTIVE,
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
        return serviceAddonRepository.findByStatusOrderByIdAsc(PackageStatus.ACTIVE).stream()
                .map(this::toAddonResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComboResponse> getAvailableCombos() {
        return serviceComboRepository.findByActiveTrueOrderByIdAsc().stream()
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
                voucher.getDiscountValue(),
                discountAmount,
                Math.max(amount - discountAmount, 0),
                voucher.getExpiresAt()
        );
    }

    @Transactional(readOnly = true)
    public ServicePackage requireActivePackage(String packageId) {
        return servicePackageRepository.findById(packageId)
                .filter(pkg -> pkg.getStatus() == PackageStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Package is not available", "BUSINESS_RULE_VIOLATION"));
    }

    @Transactional(readOnly = true)
    public ServiceCombo requireActiveCombo(String comboId) {
        return serviceComboRepository.findByIdAndActiveTrue(comboId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Combo is not available", "BUSINESS_RULE_VIOLATION"));
    }

    @Transactional(readOnly = true)
    public List<ServiceAddon> requireActiveAddons(List<String> addonIds) {
        if (addonIds == null || addonIds.isEmpty()) {
            return List.of();
        }
        return addonIds.stream()
                .map(id -> serviceAddonRepository.findByIdAndStatus(id, PackageStatus.ACTIVE)
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
        if (!voucher.isActive()) {
            throw businessRule("VOUCHER_NOT_FOUND", "Voucher not found", "USE_DIFFERENT_VOUCHER");
        }
        if (voucher.getExpiresAt().isBefore(Instant.now())) {
            throw businessRule("VOUCHER_EXPIRED", "This voucher has expired", "USE_DIFFERENT_VOUCHER");
        }
        if (amount < voucher.getMinAmount()) {
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

    private PackageResponse toPackageResponse(ServicePackage servicePackage) {
        return new PackageResponse(
                servicePackage.getId(),
                servicePackage.getName(),
                servicePackage.getDescription(),
                servicePackage.getBasePrice(),
                servicePackage.getDurationMinutes(),
                servicePackage.getCategory(),
                splitCsv(servicePackage.getFeaturesCsv()),
                servicePackage.getImageUrl(),
                servicePackage.getStatus().name(),
                servicePackage.getPopularity().name()
        );
    }

    private AddonResponse toAddonResponse(ServiceAddon addon) {
        return new AddonResponse(
                addon.getId(),
                addon.getName(),
                addon.getDescription(),
                addon.getPrice(),
                addon.getDurationMinutes(),
                addon.getCategory(),
                addon.getImageUrl(),
                splitCsv(addon.getApplicablePackagesCsv()),
                addon.getStatus().name()
        );
    }

    private ComboResponse toComboResponse(ServiceCombo combo) {
        return new ComboResponse(
                combo.getId(),
                combo.getName(),
                combo.getDescription(),
                combo.getBasePrice(),
                combo.getDurationDays(),
                combo.getMaxServices(),
                splitCsv(combo.getBenefitsCsv()),
                combo.getImageUrl(),
                combo.isActive(),
                combo.isCanUpgrade(),
                combo.getUpgradePriceFrom()
        );
    }

    private List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split("\\|")).toList();
    }

    public record PackagePage(List<PackageResponse> items, PaginationMeta pagination) {
    }
}
