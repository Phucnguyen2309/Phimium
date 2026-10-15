package com.be.validator;

import com.be.util.DateTimeUtils;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;

public class MinimumAgeValidator implements ConstraintValidator<MinimumAge, LocalDate> {
    private int minimumAge;

    @Override
    public void initialize(MinimumAge constraint) {
        minimumAge = constraint.value();
    }

    @Override
    public boolean isValid(LocalDate birthday, ConstraintValidatorContext context) {
        if (birthday == null) return true; // @NotNull handles a missing birthday.
        LocalDate today = LocalDate.now(context.getClockProvider().getClock()
                .withZone(DateTimeUtils.VIETNAM_ZONE));
        return !birthday.isAfter(today.minusYears(minimumAge));
    }
}
