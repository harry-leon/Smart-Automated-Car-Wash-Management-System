package com.autowash.loyalty.service;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.LoyaltyTier;
import com.autowash.auth.entity.UserRole;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.loyalty.dto.EarnPointsResponse;
import com.autowash.loyalty.dto.LoyaltyAccountResponse;
import com.autowash.loyalty.dto.PointTransactionResponse;
import com.autowash.loyalty.dto.RedeemPointsResponse;
import com.autowash.loyalty.entity.LoyaltyAccount;
import com.autowash.loyalty.entity.PointTransaction;
import com.autowash.loyalty.entity.PointTransactionType;
import com.autowash.loyalty.repository.LoyaltyAccountRepository;
import com.autowash.loyalty.repository.PointTransactionRepository;
import com.autowash.operation.entity.WashSession;
import com.autowash.operation.entity.WashSessionStatus;
import com.autowash.operation.repository.WashSessionRepository;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoyaltyService {

    private static final Logger log = LoggerFactory.getLogger(LoyaltyService.class);

    private final AuthUserRepository authUserRepository;
    private final WashSessionRepository washSessionRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final PointTransactionRepository pointTransactionRepository;

    public LoyaltyService(
            AuthUserRepository authUserRepository,
            WashSessionRepository washSessionRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            PointTransactionRepository pointTransactionRepository
    ) {
        this.authUserRepository = authUserRepository;
        this.washSessionRepository = washSessionRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    @Transactional
    public LoyaltyAccountResponse getAccount(UUID customerId) {
        LoyaltyAccount account = getOrCreateAccount(requireCustomer(customerId));
        return toAccountResponse(account);
    }

    @Transactional(readOnly = true)
    public int calculateEarnPoints(UUID sessionId) {
        WashSession session = requireSession(sessionId);
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(session.getBooking().getCustomer().getId())
                .orElse(null);
        LoyaltyTier tier = account == null ? session.getBooking().getCustomer().getTier() : account.getTier();
        long finalAmount = session.getBooking().getFinalAmount();
        long basePoints = finalAmount / LoyaltyRules.EARN_POINTS_UNIT_AMOUNT;
        return (int) Math.floor(basePoints * LoyaltyRules.tierMultiplier(tier));
    }

    @Transactional
    public EarnPointsResponse postEarnTransaction(UUID customerId, UUID sessionId) {
        AuthUser customer = requireCustomer(customerId);
        PointTransaction existing = pointTransactionRepository
                .findByTypeAndReferenceId(PointTransactionType.EARN, sessionId.toString())
                .orElse(null);
        if (existing != null) {
            if (!existing.getCustomer().getId().equals(customer.getId())) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Wash session does not belong to customer", "BUSINESS_RULE_VIOLATION");
            }
            return toEarnResponse(existing, getOrCreateAccount(existing.getCustomer()));
        }

        WashSession session = requireSession(sessionId);
        if (session.getStatus() != WashSessionStatus.COMPLETED) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Wash session must be COMPLETED to earn points",
                    "BUSINESS_RULE_VIOLATION"
            );
        }
        if (!session.getBooking().getCustomer().getId().equals(customer.getId())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Wash session does not belong to customer", "BUSINESS_RULE_VIOLATION");
        }

        LoyaltyAccount account = getOrCreateAccountForUpdate(customer);
        int pointsAwarded = calculateEarnPoints(sessionId);
        account.addPoints(pointsAwarded);
        PointTransaction transaction = new PointTransaction(
                customer,
                PointTransactionType.EARN,
                pointsAwarded,
                account.getCurrentPoints(),
                "Wash completed",
                sessionId.toString()
        );

        try {
            pointTransactionRepository.save(transaction);
        } catch (DataIntegrityViolationException exception) {
            PointTransaction racedTransaction = pointTransactionRepository
                    .findByTypeAndReferenceId(PointTransactionType.EARN, sessionId.toString())
                    .orElseThrow(() -> exception);
            return toEarnResponse(racedTransaction, account);
        }

        evaluateTierUpgrade(account);
        return toEarnResponse(transaction, account);
    }

    @Transactional
    public RedeemPointsResponse redeemPoints(UUID customerId, int pointsToRedeem, String referenceId) {
        AuthUser customer = requireCustomer(customerId);
        validateRedemptionAmount(pointsToRedeem);

        LoyaltyAccount account = getOrCreateAccountForUpdate(customer);
        if (account.getCurrentPoints() < pointsToRedeem) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Insufficient points: have " + account.getCurrentPoints() + ", need " + pointsToRedeem,
                    "INSUFFICIENT_POINTS"
            );
        }

        account.redeemPoints(pointsToRedeem);
        PointTransaction transaction = pointTransactionRepository.save(new PointTransaction(
                customer,
                PointTransactionType.REDEEM,
                -pointsToRedeem,
                account.getCurrentPoints(),
                "Points redeemed",
                referenceId
        ));
        return new RedeemPointsResponse(transaction.getId(), pointsToRedeem, account.getCurrentPoints());
    }

    @Transactional(readOnly = true)
    public TransactionPage getTransactionHistory(UUID customerId, String type, Instant dateFrom, Instant dateTo, int page, int limit) {
        AuthUser customer = requireCustomer(customerId);
        PointTransactionType transactionType = parseType(type);
        Page<PointTransaction> transactions = pointTransactionRepository.search(
                customer,
                transactionType,
                dateFrom,
                dateTo,
                PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("createdAt").descending())
        );
        List<PointTransactionResponse> items = transactions.getContent().stream()
                .map(this::toTransactionResponse)
                .toList();
        PaginationMeta pagination = new PaginationMeta(
                transactions.getNumber() + 1,
                transactions.getSize(),
                transactions.getTotalElements(),
                transactions.getTotalPages(),
                transactions.hasNext()
        );
        return new TransactionPage(items, pagination);
    }

    void evaluateTierUpgrade(LoyaltyAccount account) {
        LoyaltyTier targetTier = LoyaltyRules.tierForPoints(account.getCurrentPoints());
        if (targetTier.ordinal() <= account.getTier().ordinal()) {
            return;
        }

        LoyaltyTier oldTier = account.getTier();
        account.updateTier(targetTier);
        account.getCustomer().updateTier(targetTier);
        pointTransactionRepository.save(new PointTransaction(
                account.getCustomer(),
                PointTransactionType.TIER_UPGRADE,
                0,
                account.getCurrentPoints(),
                "Tier upgraded from " + oldTier + " to " + targetTier,
                null
        ));
        log.info("loyalty_tier_upgraded customerId={} oldTier={} newTier={}", account.getCustomer().getId(), oldTier, targetTier);
    }

    private LoyaltyAccount getOrCreateAccount(AuthUser customer) {
        return loyaltyAccountRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> loyaltyAccountRepository.save(new LoyaltyAccount(customer)));
    }

    private LoyaltyAccount getOrCreateAccountForUpdate(AuthUser customer) {
        LoyaltyAccount account = loyaltyAccountRepository.findLockedByCustomerId(customer.getId()).orElse(null);
        if (account != null) {
            return account;
        }
        LoyaltyAccount created = loyaltyAccountRepository.saveAndFlush(new LoyaltyAccount(customer));
        return loyaltyAccountRepository.findLockedByCustomerId(customer.getId()).orElse(created);
    }

    private AuthUser requireCustomer(UUID customerId) {
        AuthUser customer = authUserRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found", "RESOURCE_NOT_FOUND"));
        if (customer.getRole() != UserRole.CUSTOMER) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Customer not found", "RESOURCE_NOT_FOUND");
        }
        return customer;
    }

    private WashSession requireSession(UUID sessionId) {
        return washSessionRepository.findWithBookingById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wash session not found", "RESOURCE_NOT_FOUND"));
    }

    private void validateRedemptionAmount(int pointsToRedeem) {
        if (pointsToRedeem < LoyaltyRules.MIN_REDEMPTION_POINTS) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Minimum redemption is " + LoyaltyRules.MIN_REDEMPTION_POINTS + " points",
                    "BUSINESS_RULE_VIOLATION"
            );
        }
        if (pointsToRedeem > LoyaltyRules.MAX_REDEMPTION_POINTS) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Maximum redemption is " + LoyaltyRules.MAX_REDEMPTION_POINTS + " points",
                    "BUSINESS_RULE_VIOLATION"
            );
        }
    }

    private PointTransactionType parseType(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        try {
            return PointTransactionType.valueOf(type);
        } catch (IllegalArgumentException exception) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid type. Valid values: " + Arrays.toString(PointTransactionType.values()),
                    "VALIDATION_ERROR"
            );
        }
    }

    private LoyaltyAccountResponse toAccountResponse(LoyaltyAccount account) {
        return new LoyaltyAccountResponse(
                account.getCustomer().getId(),
                account.getCurrentPoints(),
                account.getTier().name(),
                account.getUpdatedAt()
        );
    }

    private EarnPointsResponse toEarnResponse(PointTransaction transaction, LoyaltyAccount account) {
        return new EarnPointsResponse(
                transaction.getId(),
                transaction.getPoints(),
                transaction.getBalanceAfter(),
                account.getTier().name()
        );
    }

    private PointTransactionResponse toTransactionResponse(PointTransaction transaction) {
        return new PointTransactionResponse(
                transaction.getId(),
                transaction.getType().name(),
                transaction.getPoints(),
                transaction.getBalanceAfter(),
                transaction.getReason(),
                transaction.getReferenceId(),
                transaction.getCreatedAt()
        );
    }

    public record TransactionPage(List<PointTransactionResponse> items, PaginationMeta pagination) {
    }
}
