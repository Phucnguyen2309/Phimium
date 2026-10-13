package com.be.service.impl;

import com.be.config.MatchingProperties;
import com.be.dto.request.AiMatchRequest;
import com.be.dto.request.PriceQuoteRequest;
import com.be.dto.response.ActivityDepartureResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.PriceQuoteResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityDeparture;
import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.enums.ActivityStatus;
import com.be.enums.BuddyStatus;
import com.be.enums.DepartureStatus;
import com.be.enums.RegistrationStatus;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.ActivityMapper;
import com.be.mapper.BuddyMapper;
import com.be.repository.ActivityDepartureRepository;
import com.be.repository.BuddyRepository;
import com.be.repository.RegistrationRepository;
import com.be.repository.UserRepository;
import com.be.service.MatchingCandidateService;
import com.be.service.PricingService;
import com.be.util.DateTimeUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MatchingCandidateServiceImpl implements MatchingCandidateService {
    private final ActivityDepartureRepository departures;
    private final BuddyRepository buddies;
    private final RegistrationRepository registrations;
    private final UserRepository users;
    private final PricingService pricing;
    private final ActivityMapper activityMapper;
    private final BuddyMapper buddyMapper;
    private final MatchingProperties properties;

    @Override
    @Transactional(readOnly = true)
    public List<Candidate> find(AiMatchRequest criteria, UUID userId) {
        User user = users.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() != UserRole.USER || user.getStatus() != UserStatus.ACTIVE)
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        int guests = criteria.getAdultCount() + criteria.getChildCount();
        var available = buddies.findMatchingCandidates(criteria.getTags(), BuddyStatus.ACTIVE, UserStatus.ACTIVE,
                UserRole.BUDDY, criteria.getRequiredLanguage(), criteria.getGuidingStyle(),
                PageRequest.of(0, properties.getBuddyLimit())).stream()
                .filter(b -> MatchingRules.buddyMatches(b, criteria.getTags(), criteria.getRequireAllTags(),
                        criteria.getRequiredLanguage(), criteria.getGuidingStyle()))
                .sorted(Comparator.<Buddy>comparingInt(b -> MatchingRules.shared(criteria.getTags(), b.getInterests()).size())
                        .reversed().thenComparing(b -> b.getAverageRating() == null ? BigDecimal.ZERO
                                : b.getAverageRating(), Comparator.reverseOrder()).thenComparing(Buddy::getBuddyId))
                .toList();
        if (available.size() < guests) return List.of();
        List<Candidate> result = new ArrayList<>();
        var dateDepartures = departures.findMatchingDepartures(criteria.getDate(), DepartureStatus.AVAILABLE,
                PageRequest.of(0, 200));
        for (ActivityDeparture departure : dateDepartures) {
            Activity a = departure.getActivity();
            if (a.getStatus() == ActivityStatus.CANCELLED || a.getStatus() == ActivityStatus.COMPLETED
                    || !departure.getStartDateTime().isAfter(DateTimeUtils.nowVietnam()) || departure.getCapacity() < guests
                    || guests > (a.getGroupMaxSize() == null ? 6 : a.getGroupMaxSize())
                    || (criteria.getEarliestStartTime() != null && departure.getStartTime().isBefore(criteria.getEarliestStartTime()))
                    || (criteria.getLatestEndTime() != null && departure.getEndTime().isAfter(criteria.getLatestEndTime()))
                    || !MatchingRules.tagsMatch(criteria.getTags(), a.getTags(), criteria.getRequireAllTags())) continue;
            if (criteria.getRegion() != null && !normalize(a.getLocationName() + " " + a.getAddress())
                    .contains(normalize(criteria.getRegion()))) continue;
            int duration = (int) Duration.between(departure.getStartTime(), departure.getEndTime()).toMinutes();
            if (a.getItineraryStops().stream().anyMatch(s -> s.getOffsetMinutes() + s.getDurationMinutes() > duration)) continue;
            Set<UUID> busy = new HashSet<>(registrations.findBusyBuddyIdsInTimeRange(departure.getDepartureDate(),
                    departure.getStartTime(), departure.getEndTime(), RegistrationStatus.CANCELLED));
            var eligible = available.stream().filter(b -> !busy.contains(b.getBuddyId())).toList();
            if (eligible.size() < guests) continue;
            var request = PriceQuoteRequest.builder().departureId(departure.getDepartureId())
                    .adultCount(criteria.getAdultCount()).childCount(criteria.getChildCount()).couponCode(criteria.getCouponCode()).build();
            PriceQuoteResponse quote = pricing.calculatePriceQuote(request, user);
            if (criteria.getCouponCode() != null && !Boolean.TRUE.equals(quote.getIsCouponApplied())) continue;
            if (criteria.getMaxTotalBudget() != null && quote.getTotalAmount().compareTo(criteria.getMaxTotalBudget()) > 0) continue;
            var response = ActivityDepartureResponse.builder().departureId(departure.getDepartureId()).activityId(a.getId())
                    .departureDate(departure.getDepartureDate()).startTime(departure.getStartTime()).endTime(departure.getEndTime())
                    .capacity(departure.getCapacity()).status(departure.getStatus()).build();
            int score = MatchingRules.shared(criteria.getTags(), a.getTags()).size() * 10
                    + eligible.stream().limit(guests).mapToInt(b -> MatchingRules.shared(criteria.getTags(), b.getInterests()).size()).sum();
            ActivityResponse activityResponse = activityMapper.toResponse(a);
            result.add(new Candidate(activityResponse, response, quote.getTotalAmount(),
                    eligible.stream().map(buddyMapper::toResponse).toList(), List.copyOf(activityResponse.getItineraryStops()), score));
        }
        return result.stream().sorted(Comparator.comparingInt(Candidate::score).reversed()
                .thenComparing(c -> c.departure().getStartTime()).thenComparing(c -> c.departure().getDepartureId()))
                .limit(properties.getCandidateLimit()).toList();
    }

    private static String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
                .replace('đ', 'd').replace('Đ', 'D').toLowerCase(Locale.ROOT).strip();
    }
}
