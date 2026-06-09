package com.autowash.booking.service;

import com.autowash.auth.entity.AuthUser;
import com.autowash.booking.dto.CustomerComboResponse;
import com.autowash.booking.dto.PurchaseCustomerComboRequest;
import com.autowash.booking.dto.PurchaseCustomerComboResponse;
import com.autowash.booking.entity.CustomerCombo;
import com.autowash.booking.entity.CustomerComboStatus;
import com.autowash.booking.entity.CustomerComboUsage;
import com.autowash.booking.repository.CustomerComboRepository;
import com.autowash.booking.repository.CustomerComboUsageRepository;
import com.autowash.catalog.entity.ServiceCombo;
import com.autowash.catalog.repository.ServiceComboRepository;
import com.autowash.shared.exception.ApiException;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerComboService {

    private final CustomerComboRepository customerComboRepository;
    private final CustomerComboUsageRepository customerComboUsageRepository;
    private final ServiceComboRepository serviceComboRepository;

    public CustomerComboService(
            CustomerComboRepository customerComboRepository,
            CustomerComboUsageRepository customerComboUsageRepository,
            ServiceComboRepository serviceComboRepository
    ) {
        this.customerComboRepository = customerComboRepository;
        this.customerComboUsageRepository = customerComboUsageRepository;
        this.serviceComboRepository = serviceComboRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerComboResponse> listActiveCustomerCombos(AuthUser customer) {
        Instant now = Instant.now();
        return customerComboRepository.findByCustomer_IdAndStatusAndExpiresAtAfter(customer.getId(), CustomerComboStatus.ACTIVE, now)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerCombo findActiveOwnedCombo(AuthUser customer, String comboId) {
        CustomerCombo combo = customerComboRepository
                .findFirstByCustomer_IdAndComboIdAndStatusOrderByCreatedAtDesc(customer.getId(), comboId, CustomerComboStatus.ACTIVE)
                .orElse(null);
        if (combo == null) {
            return null;
        }
        if (combo.isExpired()) {
            return null;
        }
        return combo;
    }

    @Transactional
    public CustomerCombo createOwnedCombo(AuthUser customer, String comboId, String purchaseBookingId) {
        ServiceCombo serviceCombo = serviceComboRepository.findByIdAndActiveTrue(comboId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Combo is not available", "BUSINESS_RULE_VIOLATION"));

        CustomerCombo combo = new CustomerCombo(
                "CC_" + System.currentTimeMillis(),
                customer,
                serviceCombo.getId(),
                purchaseBookingId,
                Math.max(serviceCombo.getMaxServices(), 1),
                Instant.now(),
                Instant.now().plusSeconds((long) serviceCombo.getDurationDays() * 24 * 60 * 60)
        );
        return customerComboRepository.save(combo);
    }

    @Transactional
    public PurchaseCustomerComboResponse purchaseCombo(AuthUser customer, PurchaseCustomerComboRequest request) {
        ServiceCombo serviceCombo = serviceComboRepository.findByIdAndActiveTrue(request.comboId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Combo is not available", "BUSINESS_RULE_VIOLATION"));

        Instant now = Instant.now();
        CustomerCombo combo = customerComboRepository.save(new CustomerCombo(
                "CC_" + System.currentTimeMillis(),
                customer,
                serviceCombo.getId(),
                null,
                Math.max(serviceCombo.getMaxServices(), 1),
                now,
                now.plusSeconds((long) serviceCombo.getDurationDays() * 24 * 60 * 60)
        ));

        return new PurchaseCustomerComboResponse(
                combo.getId(),
                serviceCombo.getId(),
                serviceCombo.getName(),
                serviceCombo.getBasePrice(),
                request.paymentMethod(),
                "PENDING",
                combo.getTotalUsages(),
                combo.getRemainingUsages(),
                combo.getActivatedAt(),
                combo.getExpiresAt(),
                combo.getCreatedAt()
        );
    }

    @Transactional
    public void recordUsage(CustomerCombo combo, String bookingId, java.time.LocalDate serviceDate) {
        combo.consumeUsage();
        customerComboUsageRepository.save(new CustomerComboUsage(combo.getId(), bookingId, serviceDate));
    }

    @Transactional
    public void markExpired(CustomerCombo combo) {
        combo.markExpired();
    }

    private CustomerComboResponse toResponse(CustomerCombo combo) {
        String comboName = serviceComboRepository.findById(combo.getComboId())
                .map(ServiceCombo::getName)
                .orElse(combo.getComboId());
        return new CustomerComboResponse(
                combo.getId(),
                combo.getComboId(),
                comboName,
                combo.getStatus().name(),
                combo.getTotalUsages(),
                combo.getRemainingUsages(),
                combo.getActivatedAt(),
                combo.getExpiresAt(),
                combo.getLastUsedAt()
        );
    }
}
