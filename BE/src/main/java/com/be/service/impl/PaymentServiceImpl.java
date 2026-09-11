package com.be.service.impl;

import com.be.config.SePayProperties;
import com.be.dto.request.CreatePaymentRequest;
import com.be.dto.request.SePayWebhookRequest;
import com.be.dto.response.CreatePaymentResponse;
import com.be.dto.response.PaymentResponse;
import com.be.entity.Payment;
import com.be.entity.Registration;
import com.be.enums.PaymentMethod;
import com.be.enums.PaymentStatus;
import com.be.enums.RegistrationStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.PaymentMapper;
import com.be.repository.PaymentRepository;
import com.be.repository.RegistrationRepository;
import com.be.service.PaymentService;
import com.be.util.SePaySignatureUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    PaymentRepository paymentRepository;
    @Autowired
    RegistrationRepository registrationRepository;
    @Autowired
    SePayProperties sePayProperties;
    @Autowired
    PaymentMapper paymentMapper;
    @Autowired
    SePaySignatureUtil sePaySignatureUtil;

    @Override
    @Transactional
    public CreatePaymentResponse createPayment(UUID registrationId, UUID currentUser, CreatePaymentRequest request) {
        Registration registration = registrationRepository.findById(registrationId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if(!registration.getUser().getUserId().equals(currentUser)){
            throw new AppException(ErrorCode.PAYMENT_ACCESS_DENIED);
        }
        boolean alreadyPaid = paymentRepository.existsByRegistrationRegistrationIdAndStatus(registrationId, PaymentStatus.PAID);
        if(alreadyPaid){
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);
        }
        BigDecimal amount = registration.getTotalAmount();

        String invoiceNumber = generateInvoiceNumber(registrationId);

        Payment payment =
                Payment.builder()
                        .registration(registration)
                        .invoiceNumber(invoiceNumber)
                        .amount(amount)
                        .currency("VND")
                        .status(PaymentStatus.PENDING)
                        .paymentMethod(
                                request.getPaymentMethod()
                        )
                        .provider("SEPAY")
                        .description(
                                "Payment for registration #"
                                        + registrationId
                        )
                        .build();
        paymentRepository.save(payment);
        Map<String,String> fields = createCheckoutFields(payment,currentUser);



        return CreatePaymentResponse
                .builder()
                .paymentId(payment.getId())
                .registrationId(registrationId)
                .invoiceNumber(
                        payment.getInvoiceNumber()
                )
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .checkoutUrl(
                        sePayProperties.getCheckoutUrl()
                )
                .fields(fields)
                .build();
    }

    @Override
    @Transactional
    public void processPayment(SePayWebhookRequest request) {
      Payment payment = paymentRepository.findByInvoiceNumber(request.getOrderInvoiceNumber()).
              orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
      if(payment.getStatus().equals(PaymentStatus.PAID)){
          return;
      }
      if(payment.getAmount().compareTo(request.getAmount()) != 0){
          throw new AppException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
      }
      if(!payment.getCurrency().equals(request.getCurrency())){
          throw new AppException(ErrorCode.PAYMENT_CURRENCY_MISMATCH);
      }
      if(isPaymentSuccessful(request)){
          paymentRepository.findByProviderTransactionId(request.getTransactionId())
                  .ifPresent(existing ->{
                      if(!existing.getId().equals(payment.getId())){
                          throw new AppException(ErrorCode.PAYMENT_TRANSACTION_DUPLICATED);
                      }
                  });
           payment.setStatus(PaymentStatus.PAID);
           payment.setProviderOrderId(request.getOrderId());
          payment.setProviderTransactionId(
                  request.getTransactionId()
          );
          payment.setPaidAt(LocalDateTime.now());
          Registration registration =
                  payment.getRegistration();

          registration.setStatus(
                  RegistrationStatus.CONFIRMED);
      }
    }

    @Override
    @Transactional
    public Page<PaymentResponse> getMyPayments(Pageable pageable, UUID userId) {
        return paymentRepository
                .findByRegistrationUserUserId(
                        userId,
                        pageable
                )
                .map(
                        paymentMapper::toResponse
                );
    }

    @Override
    @Transactional
    public PaymentResponse getPaymentHistory(UUID userId, UUID paymentId) {
        Payment payment = paymentRepository.findByIdAndRegistrationUserUserId(userId,paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        return paymentMapper.toResponse(payment);
    }

    private String generateInvoiceNumber(
            UUID registrationId
    ) {
        String random =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 8)
                        .toUpperCase();

        return "REG_"
                + registrationId
                + "_"
                + random;
    }

    private Map<String, String>
    createCheckoutFields(
            Payment payment,
            UUID userId
    ) {

        Map<String, String> fields =
                new LinkedHashMap<>();


        fields.put(
                "merchant",
                sePayProperties
                        .getMerchantId()
        );


        fields.put(
                "currency",
                "VND"
        );


        fields.put(
                "order_amount",
                payment
                        .getAmount()
                        .toBigIntegerExact()
                        .toString()
        );


        fields.put(
                "operation",
                "PURCHASE"
        );


        fields.put(
                "order_description",
                payment.getDescription()
        );


        fields.put(
                "order_invoice_number",
                payment.getInvoiceNumber()
        );


        fields.put(
                "customer_id",
                userId.toString()
        );


        /*
         * Nếu SePay yêu cầu payment_method
         * là giá trị cụ thể chứ không phải enum app,
         * map lại ở đây.
         */
        fields.put(
                "payment_method",
                mapPaymentMethod(
                        payment.getPaymentMethod()
                )
        );


        fields.put(
                "success_url",
                sePayProperties
                        .getSuccessUrl()
                        + "?paymentId="
                        + payment.getId()
        );


        fields.put(
                "error_url",
                sePayProperties
                        .getErrorUrl()
                        + "?paymentId="
                        + payment.getId()
        );


        fields.put(
                "cancel_url",
                sePayProperties
                        .getCancelUrl()
                        + "?paymentId="
                        + payment.getId()
        );


        String signature =
                sePaySignatureUtil.sign(fields);


        fields.put(
                "signature",
                signature
        );


        return fields;
    }

    private String mapPaymentMethod(
            PaymentMethod method
    ) {

        if (method == null) {
            return "BANK_TRANSFER";
        }

        return switch (method) {

            case BANK_TRANSFER ->
                    "BANK_TRANSFER";
        };
    }
    private boolean isPaymentSuccessful(
            SePayWebhookRequest request
    ) {

        return "PAID".equalsIgnoreCase(
                request.getStatus()
        )
                ||
                "CAPTURED".equalsIgnoreCase(
                        request.getOrderStatus()
                );
    }



}
