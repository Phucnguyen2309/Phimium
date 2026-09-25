package com.be;

import com.be.config.SePayProperties;
import com.be.dto.request.*;
import com.be.dto.response.*;
import com.be.entity.*;
import com.be.enums.*;
import com.be.exception.*;
import com.be.mapper.*;
import com.be.repository.*;
import com.be.service.*;
import com.be.service.impl.*;
import com.be.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(showSql = false, properties = {
        "spring.datasource.url=jdbc:h2:mem:booking;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop", "booking.hold-minutes=15",
        "sepay.merchant-id=test-merchant", "sepay.secret-key=test-signing-key",
        "sepay.ipn-secret=test-ipn-key", "sepay.checkout-url=https://pay-sandbox.sepay.vn/v1/checkout/init",
        "sepay.success-url=https://example.com/success", "sepay.error-url=https://example.com/error",
        "sepay.cancel-url=https://example.com/cancel"})
@Import({RegistrationServiceImpl.class, PricingServiceImpl.class, CouponServiceImpl.class,
        BookingLifecycleService.class, BuddyMatchingServiceImpl.class, PaymentServiceImpl.class,
        RegistrationMapper.class, ActivityGroupMapper.class, BuddyMapper.class,
        InstructionAcknowledgementMapper.class, PricingMapper.class, PaymentMapperImpl.class,
        SePayProperties.class, SePaySignatureUtil.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class BookingFlowTests {
    @Autowired RegistrationService registrations;
    @Autowired PaymentService payments;
    @Autowired BookingLifecycleService lifecycle;
    @Autowired RegistrationRepository registrationRepo;
    @Autowired PaymentRepository paymentRepo;
    @Autowired UserRepository users;
    @Autowired ActivityRepository activities;
    @Autowired ActivityDepartureRepository departures;
    @Autowired CouponRepository coupons;
    @Autowired BuddyRepository buddies;
    @Autowired PlatformTransactionManager manager;
    TransactionTemplate tx;
    User user;
    UUID departureId;

    @BeforeEach void setup() {
        tx = new TransactionTemplate(manager);
        tx.executeWithoutResult(status -> {
            user = users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@example.com")
                    .role(UserRole.USER).status(UserStatus.ACTIVE).emailVerified(true).profileCompleted(true).build());
            Activity activity = activities.saveAndFlush(Activity.builder().title("Test tour")
                    .activityType(TourType.FOODTOUR).locationName("HCM").address("District 1")
                    .participationFee(new BigDecimal("100000")).childParticipationFee(new BigDecimal("50000"))
                    .minimumParticipants(1).maximumParticipants(20).groupMinSize(1).groupMaxSize(6)
                    .status(ActivityStatus.PUBLISHED).createdBy(user).build());
            departureId = departures.saveAndFlush(ActivityDeparture.builder().activity(activity)
                    .departureDate(LocalDate.now().plusDays(2)).startTime(LocalTime.NOON)
                    .endTime(LocalTime.of(15, 0)).capacity(20).build()).getDepartureId();
        });
    }

    RegistrationRequest request() {
        var r = new RegistrationRequest();
        r.setDepartureId(departureId); r.setAdultCount(2); r.setChildCount(1);
        r.setIsSafetyTermsAccepted(true); r.setPickupLocation("  Hotel ABC, District 1  ");
        return r;
    }

    RegistrationResponse book() { return registrations.joinActivity(request(), user.getUserId()); }

    CreatePaymentResponse checkout(UUID id) {
        return payments.createPayment(id, user.getUserId(), new CreatePaymentRequest(PaymentMethod.BANK_TRANSFER));
    }

    SePayWebhookRequest receipt(CreatePaymentResponse p) {
        var r = new SePayWebhookRequest();
        r.setNotificationType("ORDER_PAID");
        var order = new SePayWebhookRequest.Order();
        order.setOrderId("order-" + p.getInvoiceNumber()); order.setOrderInvoiceNumber(p.getInvoiceNumber());
        order.setOrderAmount(p.getAmount()); order.setOrderCurrency("VND"); order.setOrderStatus("CAPTURED");
        r.setOrder(order);
        var transaction = new SePayWebhookRequest.Transaction();
        transaction.setTransactionId(UUID.randomUUID().toString());
        transaction.setTransactionType("PAYMENT"); transaction.setTransactionStatus("APPROVED");
        transaction.setTransactionAmount(p.getAmount()); transaction.setTransactionCurrency("VND");
        r.setTransaction(transaction);
        return r;
    }

    void expire(UUID id) {
        tx.executeWithoutResult(status -> registrationRepo.findById(id).orElseThrow()
                .setPaymentExpiresAt(DateTimeUtils.nowVietnam().minusSeconds(1)));
    }

    void error(ErrorCode code, org.junit.jupiter.api.function.Executable action) {
        assertEquals(code, assertThrows(AppException.class, action).getErrorCode());
    }

    @Test void bookingHoldsSeatsWithoutAssigningBuddy() {
        var r = book();
        assertEquals(RegistrationStatus.PENDING_PAYMENT, r.getStatus());
        assertEquals("Hotel ABC, District 1", r.getPickupLocation());
        assertEquals(0, new BigDecimal("250000").compareTo(r.getTotalAmount()));
        assertNotNull(r.getPaymentExpiresAt()); assertNull(r.getBuddy()); assertNull(r.getPaymentConfirmedAt());
        assertEquals(17, departures.findById(departureId).orElseThrow().getCapacity());
    }

    @Test void checkoutRetriesReuseInvoiceIncludingConcurrentRequests() throws Exception {
        UUID id = book().getRegistrationId();
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            var first = executor.submit(() -> checkout(id));
            var second = executor.submit(() -> checkout(id));
            assertEquals(first.get(20, TimeUnit.SECONDS).getPaymentId(), second.get(20, TimeUnit.SECONDS).getPaymentId());
            assertEquals(1, paymentRepo.findByRegistrationRegistrationId(id).size());
        } finally { executor.shutdownNow(); }
    }

    @Test void verifiedReceiptConfirmsOnceAndKeepsBuddyWorkflow() {
        tx.executeWithoutResult(status -> buddies.saveAndFlush(Buddy.builder().user(user)
                .status(BuddyStatus.ACTIVE).averageRating(BigDecimal.valueOf(5)).totalReviews(1).build()));
        UUID id = book().getRegistrationId();
        var p = checkout(id);
        var event = receipt(p);
        payments.processPayment(event, "test-ipn-key");
        payments.processPayment(event, "test-ipn-key");
        var r = registrationRepo.findById(id).orElseThrow();
        assertEquals(RegistrationStatus.BUDDY_ASSIGNED, r.getStatus());
        assertNotNull(r.getPaymentConfirmedAt());
        assertEquals(PaymentStatus.PAID, paymentRepo.findById(p.getPaymentId()).orElseThrow().getStatus());
        assertEquals(17, departures.findById(departureId).orElseThrow().getCapacity());
        error(ErrorCode.PAYMENT_ALREADY_PAID, () -> checkout(id));
    }

    @Test void forgedAndMismatchedReceiptsDoNotConfirmBooking() {
        UUID id = book().getRegistrationId(); var p = checkout(id); var event = receipt(p);
        error(ErrorCode.INVALID_TOKEN, () -> payments.processPayment(event, "wrong"));
        event.getTransaction().setTransactionAmount(BigDecimal.ONE);
        error(ErrorCode.PAYMENT_AMOUNT_MISMATCH, () -> payments.processPayment(event, "test-ipn-key"));
        assertEquals(RegistrationStatus.PENDING_PAYMENT, registrationRepo.findById(id).orElseThrow().getStatus());
    }

    @Test void expiryReturnsSeatsExactlyOnceAndLatePaymentNeedsReview() {
        UUID id = book().getRegistrationId(); var p = checkout(id);
        expire(id); lifecycle.expire(id); lifecycle.expire(id);
        assertEquals(20, departures.findById(departureId).orElseThrow().getCapacity());
        assertEquals(PaymentStatus.EXPIRED, paymentRepo.findById(p.getPaymentId()).orElseThrow().getStatus());
        var event = receipt(p);
        payments.processPayment(event, "test-ipn-key");
        payments.processPayment(event, "test-ipn-key");
        assertEquals(RegistrationStatus.CANCELLED, registrationRepo.findById(id).orElseThrow().getStatus());
        assertEquals(PaymentStatus.REVIEW_REQUIRED, paymentRepo.findById(p.getPaymentId()).orElseThrow().getStatus());
        assertEquals(20, departures.findById(departureId).orElseThrow().getCapacity());
    }

    @Test void checkoutOnExpiredHoldCommitsReleaseDespiteError() {
        UUID id = book().getRegistrationId(); expire(id);
        error(ErrorCode.BOOKING_EXPIRED, () -> checkout(id));
        assertEquals(RegistrationStatus.CANCELLED, registrationRepo.findById(id).orElseThrow().getStatus());
        assertEquals(20, departures.findById(departureId).orElseThrow().getCapacity());
    }

    @Test void cancelUnpaidOrderRestoresCouponAndRejectsCheckout() {
        String code = UUID.randomUUID().toString();
        tx.executeWithoutResult(status -> coupons.saveAndFlush(Coupon.builder().code(code).name("Test")
                .discountType(CouponDiscountType.FIXED_AMOUNT).discountValue(BigDecimal.valueOf(10000))
                .validFrom(DateTimeUtils.nowVietnam().minusDays(1)).validUntil(DateTimeUtils.nowVietnam().plusDays(1))
                .usageLimit(1).build()));
        var req = request(); req.setCouponCode(code);
        UUID id = registrations.joinActivity(req, user.getUserId()).getRegistrationId();
        assertEquals(1, coupons.findByCode(code).orElseThrow().getUsedCount());
        registrations.cancelRegistration(id, user);
        assertEquals(0, coupons.findByCode(code).orElseThrow().getUsedCount());
        assertEquals(20, departures.findById(departureId).orElseThrow().getCapacity());
        error(ErrorCode.PAYMENT_INVALID_STATUS, () -> checkout(id));
        error(ErrorCode.REGISTRATION_ALREADY_CANCELLED, () -> registrations.cancelRegistration(id, user));
        assertEquals(20, departures.findById(departureId).orElseThrow().getCapacity());
    }

    @Test void paidOrderCannotBeCancelledWithoutRefundReview() {
        UUID id = book().getRegistrationId();
        payments.processPayment(receipt(checkout(id)), "test-ipn-key");
        error(ErrorCode.PAYMENT_REVIEW_REQUIRED, () -> registrations.cancelRegistration(id, user));
        assertEquals(17, departures.findById(departureId).orElseThrow().getCapacity());
    }

    @Test void invalidGuestCountsAndPastDepartureRejected() {
        var req = request(); req.setChildCount(-2);
        error(ErrorCode.INVALID_GUEST_COUNT, () -> registrations.joinActivity(req, user.getUserId()));
        req.setChildCount(0);
        tx.executeWithoutResult(status -> departures.findById(departureId).orElseThrow().setDepartureDate(LocalDate.now().minusDays(1)));
        error(ErrorCode.DEPARTURE_IN_PAST, () -> registrations.joinActivity(req, user.getUserId()));
    }

    @Test void freeBookingBypassesSePayButIsConfirmed() {
        tx.executeWithoutResult(status -> {
            Activity a = departures.findById(departureId).orElseThrow().getActivity();
            a.setParticipationFee(BigDecimal.ZERO); a.setChildParticipationFee(BigDecimal.ZERO);
        });
        var r = book();
        assertNotNull(r.getPaymentConfirmedAt());
        assertNotEquals(RegistrationStatus.PENDING_PAYMENT, r.getStatus());
        assertTrue(paymentRepo.findByRegistrationRegistrationId(r.getRegistrationId()).isEmpty());
        registrations.cancelRegistration(r.getRegistrationId(), user);
        assertEquals(20, departures.findById(departureId).orElseThrow().getCapacity());
    }

    @Test void voidNotificationCannotBeOverwrittenByPaidRetry() {
        UUID id = book().getRegistrationId(); var event = receipt(checkout(id));
        payments.processPayment(event, "test-ipn-key");
        event.setNotificationType("TRANSACTION_VOID");
        payments.processPayment(event, "test-ipn-key");
        event.setNotificationType("ORDER_PAID");
        payments.processPayment(event, "test-ipn-key");
        assertEquals(RegistrationStatus.PAYMENT_REVIEW, registrationRepo.findById(id).orElseThrow().getStatus());
        assertNull(registrationRepo.findById(id).orElseThrow().getPaymentConfirmedAt());
    }

    @Test void paymentReadIsScopedToOwner() {
        UUID id = book().getRegistrationId(); var p = checkout(id);
        assertEquals(p.getPaymentId(), payments.getPaymentHistory(p.getPaymentId(), user.getUserId()).getId());
        error(ErrorCode.PAYMENT_NOT_FOUND, () -> payments.getPaymentHistory(p.getPaymentId(), UUID.randomUUID()));
    }
    User anotherUser() {
        return tx.execute(status -> users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@example.com")
                .role(UserRole.USER).status(UserStatus.ACTIVE).emailVerified(true).profileCompleted(true).build()));
    }

    @Test void concurrentBookingsCannotOversellDeparture() throws Exception {
        tx.executeWithoutResult(status -> departures.findById(departureId).orElseThrow().setCapacity(3));
        User second = anotherUser();
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch start = new CountDownLatch(1);
        try {
            Callable<Boolean> firstTask = () -> {
                start.await();
                try { registrations.joinActivity(request(), user.getUserId()); return true; }
                catch (AppException e) { return false; }
            };
            Callable<Boolean> secondTask = () -> {
                start.await();
                try { registrations.joinActivity(request(), second.getUserId()); return true; }
                catch (AppException e) { return false; }
            };
            var a = executor.submit(firstTask); var b = executor.submit(secondTask); start.countDown();
            assertNotEquals(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS));
            assertEquals(0, departures.findById(departureId).orElseThrow().getCapacity());
        } finally { executor.shutdownNow(); }
    }

    @Test void groupsCountGuestsAndNeverMixDepartures() {
        UUID first = book().getRegistrationId();
        payments.processPayment(receipt(checkout(first)), "test-ipn-key");
        User second = anotherUser();
        var req = request(); req.setAdultCount(4); req.setChildCount(0);
        UUID next = registrations.joinActivity(req, second.getUserId()).getRegistrationId();
        var pay = payments.createPayment(next, second.getUserId(), new CreatePaymentRequest());
        payments.processPayment(receipt(pay), "test-ipn-key");
        UUID firstGroup = tx.execute(status -> registrationRepo.findById(first).orElseThrow().getGroup().getGroupId());
        UUID secondGroup = tx.execute(status -> registrationRepo.findById(next).orElseThrow().getGroup().getGroupId());
        assertNotEquals(firstGroup, secondGroup); // 3 + 4 exceeds the group limit of 6.
        UUID otherDeparture = tx.execute(status -> departures.saveAndFlush(ActivityDeparture.builder()
                .activity(departures.findById(departureId).orElseThrow().getActivity())
                .departureDate(LocalDate.now().plusDays(3)).startTime(LocalTime.NOON).endTime(LocalTime.of(15, 0))
                .capacity(20).build()).getDepartureId());
        req.setDepartureId(otherDeparture); req.setAdultCount(1);
        UUID last = registrations.joinActivity(req, user.getUserId()).getRegistrationId();
        payments.processPayment(receipt(checkout(last)), "test-ipn-key");
        UUID lastGroup = tx.execute(status -> registrationRepo.findById(last).orElseThrow().getGroup().getGroupId());
        assertNotEquals(firstGroup, lastGroup); assertNotEquals(secondGroup, lastGroup);
    }

    @Test void receiptForCancelledDepartureRequiresReviewAndReleasesSeats() {
        UUID id = book().getRegistrationId(); var event = receipt(checkout(id));
        tx.executeWithoutResult(status -> departures.findById(departureId).orElseThrow().setStatus(DepartureStatus.CANCELLED));
        payments.processPayment(event, "test-ipn-key");
        assertEquals(RegistrationStatus.CANCELLED, registrationRepo.findById(id).orElseThrow().getStatus());
        assertEquals(PaymentStatus.REVIEW_REQUIRED, paymentRepo.findByRegistrationRegistrationId(id).get(0).getStatus());
        assertEquals(20, departures.findById(departureId).orElseThrow().getCapacity());
        assertEquals(DepartureStatus.CANCELLED, departures.findById(departureId).orElseThrow().getStatus());
    }

    @Test void wrongCurrencyAndReusedProviderTransactionRejected() {
        UUID first = book().getRegistrationId(); var event = receipt(checkout(first));
        event.getTransaction().setTransactionCurrency("USD");
        error(ErrorCode.PAYMENT_CURRENCY_MISMATCH, () -> payments.processPayment(event, "test-ipn-key"));
        event.getTransaction().setTransactionCurrency("VND");
        payments.processPayment(event, "test-ipn-key");
        User second = anotherUser();
        UUID secondId = registrations.joinActivity(request(), second.getUserId()).getRegistrationId();
        var secondEvent = receipt(payments.createPayment(secondId, second.getUserId(), new CreatePaymentRequest()));
        secondEvent.getTransaction().setTransactionId(event.getTransaction().getTransactionId());
        error(ErrorCode.PAYMENT_TRANSACTION_DUPLICATED, () -> payments.processPayment(secondEvent, "test-ipn-key"));
        assertEquals(RegistrationStatus.PENDING_PAYMENT, registrationRepo.findById(secondId).orElseThrow().getStatus());
    }}
