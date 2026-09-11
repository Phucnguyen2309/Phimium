package com.be.mapper;

import com.be.dto.response.PaymentResponse;
import com.be.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(
            target = "registrationId",
            source = "registration.registrationId"
    )
    PaymentResponse toResponse(Payment payment);
}
