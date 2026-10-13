package com.be.dto.request;

import com.be.enums.GuidingStyle;
import com.be.enums.MatchingTag;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Data
public class AiMatchRequest {
    @Size(max = 1000)
    private String message;
    @Size(max = 16)
    private Set<@NotNull MatchingTag> tags;
    private LocalDate date;
    private LocalTime earliestStartTime;
    private LocalTime latestEndTime;
    @Min(1) @Max(1000)
    private Integer adultCount;
    @Min(0) @Max(1000)
    private Integer childCount;
    @Size(max = 200)
    private String region;
    @DecimalMin("0") @Digits(integer = 12, fraction = 2)
    private BigDecimal maxTotalBudget;
    @Pattern(regexp = "[a-zA-Z]{2,3}")
    private String requiredLanguage;
    private GuidingStyle guidingStyle;
    private Boolean requireAllTags;
    @Size(max = 100)
    private String couponCode;
    @NotNull @Pattern(regexp = "vi|en")
    private String locale = "vi";
}
