package com.autowash.service;

import com.autowash.entity.User;
import com.autowash.entity.enums.LoyaltyTier;
import com.autowash.dto.CustomerPromotionResponse;
import com.autowash.dto.PromotionRequest;
import com.autowash.dto.PromotionResponse;
import com.autowash.entity.enums.DiscountType;
import com.autowash.entity.Promotion;
import com.autowash.entity.enums.ActiveStatus;
import com.autowash.entity.enums.PromotionTargetingMode;
import com.autowash.repository.PromotionRepository;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import com.autowash.service.CurrentUserService;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PromotionService {

    private static final List<String> ALL_TIERS = Arrays.stream(LoyaltyTier.values()).map(Enum::name).toList();

    private final PromotionRepository promotionRepository;
    private final CurrentUserService currentUserService;

    public PromotionService(PromotionRepository promotionRepository, CurrentUserService currentUserService) {
        this.promotionRepository = promotionRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public PromotionResponse create(PromotionRequest request) {
        ValidatedPromotion validated = validate(request);
        Promotion promotion = new Promotion(
                request.name(),
                request.description(),
                BigDecimal.valueOf(request.discountValue()).movePointLeft(2),
                request.startDate(),
                request.endDate(),
                request.targetingMode(),
                request.status()
        );
        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional(readOnly = true)
    public PromotionResponse getById(String promotionId) {
        return toResponse(requirePromotion(promotionId));
    }

    @Transactional(readOnly = true)
    public PromotionPage listAdmin(int page, int limit) {
        Page<Promotion> promotions = promotionRepository.findAllByOrderByCreatedAtDesc(pageRequest(page, limit));
        return toPage(promotions);
    }

    @Transactional
    public PromotionResponse update(String promotionId, PromotionRequest request) {
        Promotion promotion = requirePromotion(promotionId);
        ValidatedPromotion validated = validate(request);
        promotion.update(
                request.name(),
                request.description(),
                BigDecimal.valueOf(request.discountValue()).movePointLeft(2),
                request.startDate(),
                request.endDate(),
                request.targetingMode(),
                request.status()
        );
        return toResponse(promotion);
    }

    @Transactional
    public PromotionResponse delete(String promotionId) {
        Promotion promotion = requirePromotion(promotionId);
        PromotionResponse response = toResponse(promotion);
        promotionRepository.delete(promotion);
        return response;
    }

    @Transactional(readOnly = true)
    public PromotionPage listActiveForCurrentCustomer(int page, int limit) {
        User user = currentUserService.getCurrentUser();
        Page<Promotion> promotions = promotionRepository.findActiveForTier(
                Instant.now(),
                user.getTier().name(),
                ActiveStatus.ACTIVE,
                PromotionTargetingMode.ALL_TIERS,
                pageRequest(page, limit)
        );
        return toPage(promotions);
    }

    @Transactional(readOnly = true)
    public List<CustomerPromotionResponse> listActiveLegacyForCurrentCustomer() {
        return listActiveForCurrentCustomer(1, 100).items().stream()
                .map(this::toCustomerPromotionResponse)
                .toList();
    }

    private Promotion requirePromotion(String promotionId) {
        return promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Promotion not found", "RESOURCE_NOT_FOUND"));
    }

    private ValidatedPromotion validate(PromotionRequest request) {
        if (request.startDate().isAfter(request.endDate())) {
            throw validationError("startDate", "startDate must be before or equal to endDate");
        }
        if (request.discountType() == DiscountType.PERCENT && request.discountValue() > 100) {
            throw validationError("discountValue", "Percent discount must be between 1 and 100");
        }
        if (request.targetingMode() == PromotionTargetingMode.SELECTED_TIERS) {
            if (request.applicableTiers() == null || request.applicableTiers().isEmpty()) {
                throw validationError("applicableTiers", "At least one tier is required for SELECTED_TIERS");
            }
            String tiers = request.applicableTiers().stream()
                    .distinct()
                    .map(Enum::name)
                    .reduce((left, right) -> left + "," + right)
                    .orElseThrow();
            return new ValidatedPromotion(tiers);
        }
        return new ValidatedPromotion(null);
    }

    private ApiException validationError(String field, String message) {
        return new ApiException(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                "VALIDATION_ERROR",
                Map.of("field", field, "message", message)
        );
    }

    private PromotionPage toPage(Page<Promotion> page) {
        List<PromotionResponse> items = page.getContent().stream().map(this::toResponse).toList();
        PaginationMeta pagination = new PaginationMeta(
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext()
        );
        return new PromotionPage(items, pagination);
    }

    private PageRequest pageRequest(int page, int limit) {
        return PageRequest.of(Math.max(page - 1, 0), limit);
    }

    private PromotionResponse toResponse(Promotion promotion) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getName(),
                promotion.getDescription(),
                "POINT_MULTIPLIER",
                promotion.getDiscountValue().movePointRight(2).intValue(),
                promotion.getStartDate(),
                promotion.getEndDate(),
                promotion.getTargetingMode().name(),
                List.of(),
                null,
                promotion.getStatus().name(),
                promotion.getCreatedAt(),
                promotion.getUpdatedAt()
        );
    }

    private CustomerPromotionResponse toCustomerPromotionResponse(PromotionResponse promotion) {
        return new CustomerPromotionResponse(
                promotion.name(),
                promotion.name(),
                promotion.targetingMode(),
                promotion.applicableTiers(),
                "POINT_MULTIPLIER",
                promotion.discountValue(),
                0,
                false,
                promotion.endDate()
        );
    }

    private List<String> resolveApplicableTiers(Promotion promotion) {
        if (promotion.getTargetingMode() == PromotionTargetingMode.ALL_TIERS) {
            return ALL_TIERS;
        }
        if (promotion.getApplicableTiersCsv() == null || promotion.getApplicableTiersCsv().isBlank()) {
            return List.of();
        }
        return Arrays.stream(promotion.getApplicableTiersCsv().split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private record ValidatedPromotion(String applicableTiersCsv) {
    }

    public record PromotionPage(List<PromotionResponse> items, PaginationMeta pagination) {
    }
}

