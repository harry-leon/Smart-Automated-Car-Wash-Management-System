package com.autowash.service;

import com.autowash.entity.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;


import com.autowash.entity.enums.LoyaltyTier;
import com.autowash.repository.AuthUserRepository;

import com.autowash.entity.enums.PaymentMethod;
import com.autowash.repository.CustomerBookingRepository;
import com.autowash.repository.VoucherRepository;
import com.autowash.dto.EarnPointsResponse;
import com.autowash.dto.RedeemPointsResponse;


import com.autowash.entity.enums.PointTransactionType;
import com.autowash.repository.LoyaltyAccountRepository;
import com.autowash.repository.PointTransactionRepository;

import com.autowash.repository.WashSessionRepository;
import com.autowash.shared.exception.ApiException;

import com.autowash.entity.enums.VehicleType;
import com.autowash.repository.CustomerVehicleRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class LoyaltyServiceTest {

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private CustomerVehicleRepository customerVehicleRepository;

    @Autowired
    private CustomerBookingRepository customerBookingRepository;

    @Autowired
    private WashSessionRepository washSessionRepository;

    @Autowired
    private LoyaltyAccountRepository loyaltyAccountRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Test
    void calculateEarnPointsUsesFinalAmountAndTierMultiplier() {
        TestData data = createCompletedSession("0901888001", "LOY_SVC_001", 150000);
        assertThat(loyaltyService.calculateEarnPoints(data.session().getId())).isEqualTo(15);

        LoyaltyAccount account = loyaltyAccountRepository.save(new LoyaltyAccount(data.customer()));
        account.updateTier(LoyaltyTier.GOLD);
        loyaltyAccountRepository.saveAndFlush(account);

        assertThat(loyaltyService.calculateEarnPoints(data.session().getId())).isEqualTo(22);
    }

    @Test
    void postEarnTransactionCreatesLedgerUpdatesBalanceAndIsIdempotent() {
        TestData data = createCompletedSession("0901888002", "LOY_SVC_002", 270000);

        EarnPointsResponse first = loyaltyService.postEarnTransaction(data.customer().getId(), data.session().getId());
        EarnPointsResponse second = loyaltyService.postEarnTransaction(data.customer().getId(), data.session().getId());

        assertThat(first.pointsAwarded()).isEqualTo(27);
        assertThat(second.transactionId()).isEqualTo(first.transactionId());
        assertThat(second.newBalance()).isEqualTo(first.newBalance());
        assertThat(pointTransactionRepository.countByTypeAndReferenceId(
                PointTransactionType.EARN,
                data.session().getId().toString()
        )).isEqualTo(1);
    }

    @Test
    void redeemPointsReducesBalanceAndWritesNegativeTransaction() {
        TestData data = createCompletedSession("0901888003", "LOY_SVC_003", 600000);
        loyaltyService.postEarnTransaction(data.customer().getId(), data.session().getId());

        RedeemPointsResponse response = loyaltyService.redeemPoints(data.customer().getId(), 50, data.booking().getId());

        assertThat(response.pointsRedeemed()).isEqualTo(50);
        assertThat(response.newBalance()).isEqualTo(10);
        assertThat(response.voucherCode()).startsWith("LOY-");
        assertThat(response.voucherValue()).isEqualTo(50_000);
        assertThat(response.status()).isEqualTo("SUCCESS");
        assertThat(response.expiresAt()).isAfter(Instant.now());
        assertThat(voucherRepository.findByCode(response.voucherCode())).isPresent();
        PointTransaction redemption = pointTransactionRepository.search(
                data.customer(),
                PointTransactionType.REDEEM,
                null,
                null,
                org.springframework.data.domain.PageRequest.of(0, 20)
        ).getContent().getFirst();
        assertThat(redemption.getPoints()).isEqualTo(-50);
        assertThat(redemption.getReason()).isEqualTo("Voucher redemption: " + response.voucherCode());
        assertThat(redemption.getReferenceId()).isEqualTo(response.voucherCode());
        assertThat(loyaltyService.getAccount(data.customer().getId()).totalEarnedPoints()).isEqualTo(60);
    }

    @Test
    void redeemPointsRejectsBelowMinimumAndInsufficientBalance() {
        TestData data = createCompletedSession("0901888004", "LOY_SVC_004", 270000);
        loyaltyService.getAccount(data.customer().getId());

        assertThatThrownBy(() -> loyaltyService.redeemPoints(data.customer().getId(), 49, null))
                .isInstanceOf(ApiException.class)
                .hasMessage("Minimum redemption is 50 points");

        assertThatThrownBy(() -> loyaltyService.redeemPoints(data.customer().getId(), 201, null))
                .isInstanceOf(ApiException.class)
                .hasMessage("Maximum redemption is 200 points");

        assertThatThrownBy(() -> loyaltyService.redeemPoints(data.customer().getId(), 50, null))
                .isInstanceOf(ApiException.class)
                .hasMessage("Insufficient points: have 0, need 50");
    }

    @Test
    void earnEvaluatesTierUpgradeWithoutDowngradingOnRedeem() {
        TestData data = createCompletedSession("0901888005", "LOY_SVC_005", 5_100_000);

        EarnPointsResponse earnResponse = loyaltyService.postEarnTransaction(data.customer().getId(), data.session().getId());
        assertThat(earnResponse.newBalance()).isEqualTo(510);
        assertThat(earnResponse.tier()).isEqualTo("SILVER");

        loyaltyService.redeemPoints(data.customer().getId(), 200, data.booking().getId());
        assertThat(loyaltyService.getAccount(data.customer().getId()).tier()).isEqualTo("SILVER");
    }

    @Test
    void earnRejectsNonCompletedSession() {
        TestData data = createPendingSession("0901888006", "LOY_SVC_006", 270000);

        assertThatThrownBy(() -> loyaltyService.postEarnTransaction(data.customer().getId(), data.session().getId()))
                .isInstanceOf(ApiException.class)
                .hasMessage("Wash session must be COMPLETED to earn points");
    }

    private TestData createCompletedSession(String phone, String bookingId, long finalAmount) {
        TestData data = createPendingSession(phone, bookingId, finalAmount);
        Instant now = Instant.now();
        data.session().queue(now);
        data.session().checkIn(now, finalAmount, "VND", 0);
        data.session().start(now);
        data.session().complete(now, 0);
        washSessionRepository.saveAndFlush(data.session());
        return data;
    }

    private TestData createPendingSession(String phone, String bookingId, long finalAmount) {
        AuthUser user = new AuthUser("Nguyen Van A", phone, phone + "@example.com", "hash");
        user.activate();
        authUserRepository.save(user);

        CustomerVehicle vehicle = customerVehicleRepository.save(new CustomerVehicle(
                user,
                "30H-" + phone.substring(phone.length() - 6),
                VehicleType.CAR,
                "Toyota",
                "Camry",
                2023,
                "Silver",
                true
        ));

        CustomerBooking booking = new CustomerBooking(
                bookingId,
                user,
                vehicle,
                "pkg_001",
                null,
                null,
                LocalDate.now().plusDays(1),
                LocalTime.of(14, 0),
                PaymentMethod.E_WALLET,
                finalAmount,
                0,
                0,
                finalAmount,
                30
        );
        booking.confirmByOtp();
        customerBookingRepository.save(booking);
        WashSession session = washSessionRepository.saveAndFlush(new WashSession(booking, "Loyalty service test"));
        return new TestData(user, booking, session);
    }

    private record TestData(AuthUser customer, CustomerBooking booking, WashSession session) {
    }
}
