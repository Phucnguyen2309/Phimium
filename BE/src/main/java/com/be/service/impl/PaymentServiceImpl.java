package com.be.service.impl;

import com.be.config.SePayProperties;
import com.be.dto.request.*;
import com.be.dto.response.*;
import com.be.entity.*;
import com.be.enums.*;
import com.be.exception.*;
import com.be.mapper.PaymentMapper;
import com.be.repository.*;
import com.be.service.BookingLifecycleService;
import com.be.service.PaymentService;
import com.be.util.DateTimeUtils;
import com.be.util.SePaySignatureUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final RegistrationRepository registrationRepository;
    private final SePayProperties sePayProperties;
    private final PaymentMapper paymentMapper;
    private final SePaySignatureUtil sePaySignatureUtil;
    private final BookingLifecycleService lifecycle;

    @Override
    @Transactional(noRollbackFor = AppException.class)
    public CreatePaymentResponse createPayment(UUID registrationId, UUID currentUser, CreatePaymentRequest request) {
        Registration registration = registrationRepository.findByIdWithLock(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));
        if (!registration.getUser().getUserId().equals(currentUser)) {
            throw new AppException(ErrorCode.PAYMENT_ACCESS_DENIED);
        }
        if (registration.getPaymentConfirmedAt() != null) throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);
        if (registration.getStatus() != RegistrationStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.PAYMENT_INVALID_STATUS);
        }
        if (lifecycle.isExpired(registration)) {
            lifecycle.release(registration);
            throw new AppException(ErrorCode.BOOKING_EXPIRED);
        }
        if (!lifecycle.canFulfill(registration)) {
            lifecycle.release(registration);
            throw new AppException(ErrorCode.DEPARTURE_NOT_AVAILABLE);
        }
        requireCheckoutConfiguration();
        if (registration.getTotalAmount().signum() <= 0) throw new AppException(ErrorCode.PAYMENT_INVALID_STATUS);
        var attempts = paymentRepository.findByRegistrationRegistrationId(registrationId);
        if (attempts.stream().anyMatch(p -> p.getStatus() == PaymentStatus.PAID
                || p.getStatus() == PaymentStatus.REVIEW_REQUIRED)) {
            throw new AppException(ErrorCode.PAYMENT_REVIEW_REQUIRED);
        }
        Payment payment = attempts.stream().filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .findFirst().orElse(null);
        if (payment == null) {
            payment = Payment.builder().registration(registration)
                    .invoiceNumber("REG_" + UUID.randomUUID().toString().replace("-", ""))
                    .amount(registration.getTotalAmount()).currency("VND").status(PaymentStatus.PENDING)
                    .paymentMethod(request.getPaymentMethod() == null ? PaymentMethod.BANK_TRANSFER : request.getPaymentMethod())
                    .provider("SEPAY").description("Payment for registration #" + registrationId).build();
            paymentRepository.saveAndFlush(payment);
        }
        return CreatePaymentResponse.builder().paymentId(payment.getId()).registrationId(registrationId)
                .invoiceNumber(payment.getInvoiceNumber()).amount(payment.getAmount())
                .currency(payment.getCurrency()).status(payment.getStatus())
                .checkoutUrl(sePayProperties.getCheckoutUrl()).fields(createCheckoutFields(payment, currentUser)).build();
    }

    @Override
    @Transactional
    public void processPayment(SePayWebhookRequest request, String secret) {
        String expected = sePayProperties.getIpnSecret();
        if (expected == null || expected.isBlank()) throw new AppException(ErrorCode.SEPAY_NOT_CONFIGURED);
        if (secret == null || !MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                secret.getBytes(StandardCharsets.UTF_8))) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (!"ORDER_PAID".equals(request.getNotificationType())
                && !"TRANSACTION_VOID".equals(request.getNotificationType())) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_NOTIFICATION);
        }
        var order = request.getOrder();
        var transaction = request.getTransaction();
        if (order == null || transaction == null) throw new AppException(ErrorCode.INVALID_PAYMENT_NOTIFICATION);
        UUID registrationId = paymentRepository.findRegistrationIdByInvoiceNumber(order.getOrderInvoiceNumber())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        Registration registration = registrationRepository.findByIdWithLock(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_FOUND));
        Payment payment = paymentRepository.findByInvoiceNumberWithLock(order.getOrderInvoiceNumber())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getAmount().compareTo(order.getOrderAmount()) != 0
                || payment.getAmount().compareTo(transaction.getTransactionAmount()) != 0) {
            throw new AppException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }
        if (!payment.getCurrency().equals(order.getOrderCurrency())
                || !payment.getCurrency().equals(transaction.getTransactionCurrency())) {
            throw new AppException(ErrorCode.PAYMENT_CURRENCY_MISMATCH);
        }
        if ("TRANSACTION_VOID".equals(request.getNotificationType())) {
            // Financial reversal needs reconciliation; never let a later retry revive the booking.
            payment.setStatus(PaymentStatus.REVIEW_REQUIRED);
            if (registration.getStatus() == RegistrationStatus.PENDING_PAYMENT) lifecycle.release(registration);
            else if (registration.getStatus() != RegistrationStatus.CANCELLED) {
                registration.setStatus(RegistrationStatus.PAYMENT_REVIEW);
                registration.setPaymentConfirmedAt(null);
            }
            return;
        }
        if (!"CAPTURED".equals(order.getOrderStatus()) || !"PAYMENT".equals(transaction.getTransactionType())
                || !"APPROVED".equals(transaction.getTransactionStatus())) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_NOTIFICATION);
        }
        paymentRepository.findByProviderTransactionId(transaction.getTransactionId()).ifPresent(other -> {
            if (!other.getId().equals(payment.getId())) throw new AppException(ErrorCode.PAYMENT_TRANSACTION_DUPLICATED);
        });
        if (payment.getProviderTransactionId() != null) {
            if (!payment.getProviderTransactionId().equals(transaction.getTransactionId())) {
                throw new AppException(ErrorCode.PAYMENT_TRANSACTION_DUPLICATED);
            }
            return; // Authenticated retry of an already recorded receipt.
        }
        boolean review = payment.getStatus() == PaymentStatus.REVIEW_REQUIRED
                || registration.getStatus() != RegistrationStatus.PENDING_PAYMENT || lifecycle.isExpired(registration) || !lifecycle.canFulfill(registration);
        payment.setProviderOrderId(order.getOrderId());
        payment.setProviderTransactionId(transaction.getTransactionId());
        payment.setPaidAt(DateTimeUtils.nowVietnam());
        if (review) {
            if (registration.getStatus() == RegistrationStatus.PENDING_PAYMENT) lifecycle.release(registration);
            payment.setStatus(PaymentStatus.REVIEW_REQUIRED);
        } else {
            payment.setStatus(PaymentStatus.PAID);
            lifecycle.confirm(registration);
        }
        paymentRepository.saveAndFlush(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getMyPayments(Pageable pageable, UUID userId) {
        return paymentRepository.findByRegistrationUserUserId(userId, pageable).map(paymentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentHistory(UUID paymentId, UUID userId) {
        return paymentMapper.toResponse(paymentRepository.findByIdAndRegistrationUserUserId(paymentId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND)));
    }

    private void requireCheckoutConfiguration() {
        for (String value : new String[]{sePayProperties.getMerchantId(), sePayProperties.getSecretKey(),
                sePayProperties.getCheckoutUrl(), sePayProperties.getSuccessUrl(), sePayProperties.getErrorUrl(),
                sePayProperties.getCancelUrl(), sePayProperties.getIpnSecret()}) {
            if (value == null || value.isBlank()) throw new AppException(ErrorCode.SEPAY_NOT_CONFIGURED);
        }
    }

    private String returnUrl(String base, UUID paymentId) {
        return UriComponentsBuilder.fromUriString(base).queryParam("paymentId", paymentId).build().toUriString();
    }

    private Map<String, String> createCheckoutFields(Payment payment, UUID userId) {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("order_amount", payment.getAmount().toBigIntegerExact().toString());
        fields.put("merchant", sePayProperties.getMerchantId());
        fields.put("currency", "VND");
        fields.put("operation", "PURCHASE");
        fields.put("order_description", payment.getDescription());
        fields.put("order_invoice_number", payment.getInvoiceNumber());
        fields.put("customer_id", userId.toString());
        fields.put("payment_method", payment.getPaymentMethod().name());
        fields.put("success_url", returnUrl(sePayProperties.getSuccessUrl(), payment.getId()));
        fields.put("error_url", returnUrl(sePayProperties.getErrorUrl(), payment.getId()));
        fields.put("cancel_url", returnUrl(sePayProperties.getCancelUrl(), payment.getId()));
        fields.put("signature", sePaySignatureUtil.sign(fields));
        return fields;
    }
}
