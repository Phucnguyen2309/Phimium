package com.be.service.impl;

import com.be.config.MatchingProperties;
import com.be.dto.request.AiMatchRequest;
import com.be.dto.request.PriceQuoteRequest;
import com.be.dto.response.ActivityDepartureResponse;
import com.be.dto.response.ActivityResponse;
import com.be.dto.response.PriceQuoteResponse;
import com.be.dto.response.AiMatchResponse.Reason;
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
import java.text.NumberFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingCandidateServiceImpl implements MatchingCandidateService {
    private static final int DEPARTURE_SEARCH_LIMIT = 200;
    private static final int ALTERNATIVE_DATE_DAYS = 30;
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
        return search(criteria, userId).candidates();
    }

    @Override
    @Transactional(readOnly = true)
    public SearchResult search(AiMatchRequest criteria, UUID userId) {
        User user = users.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() != UserRole.USER || user.getStatus() != UserStatus.ACTIVE)
            throw new AppException(ErrorCode.USER_NOT_AUTHORIZED);
        int guests = criteria.getAdultCount() + criteria.getChildCount();
        LocalDateTime now = DateTimeUtils.nowVietnam();
        var dateDepartures = departures.findMatchingDepartures(criteria.getDate(), DepartureStatus.AVAILABLE,
                PageRequest.of(0, DEPARTURE_SEARCH_LIMIT));
        if (dateDepartures.isEmpty()) return noDeparturesOnDate(criteria, guests, now);

        Map<Rejection, List<ActivityDeparture>> rejected = new LinkedHashMap<>();
        List<ActivityDeparture> tourOptions = new ArrayList<>();
        for (ActivityDeparture departure : dateDepartures) {
            Rejection rejection = tourRejection(departure, criteria, guests, now);
            if (rejection == null) tourOptions.add(departure);
            else reject(rejected, rejection, departure);
        }
        if (tourOptions.isEmpty()) return rejectedResult(criteria, guests, rejected, null, 0);

        var available = buddies.findMatchingCandidates(criteria.getTags(), BuddyStatus.ACTIVE, UserStatus.ACTIVE,
                UserRole.BUDDY, criteria.getRequiredLanguage(), criteria.getGuidingStyle(),
                PageRequest.of(0, properties.getBuddyLimit())).stream()
                .filter(b -> MatchingRules.buddyMatches(b, criteria.getTags(), criteria.getRequireAllTags(),
                        criteria.getRequiredLanguage(), criteria.getGuidingStyle()))
                .sorted(Comparator.<Buddy>comparingInt(b -> MatchingRules.shared(criteria.getTags(), b.getInterests()).size())
                        .reversed().thenComparing(b -> b.getAverageRating() == null ? BigDecimal.ZERO
                                : b.getAverageRating(), Comparator.reverseOrder()).thenComparing(Buddy::getBuddyId))
                .toList();
        if (available.size() < guests) {
            String message = text(criteria,
                    "Nhóm " + guests + " khách cần " + guests + " Buddy; hiện tìm thấy " + available.size()
                            + " Buddy đáp ứng tag, ngôn ngữ và phong cách đã chọn.",
                    "Your group needs " + guests + " Buddies; " + available.size()
                            + " were found with the selected interests, language and guiding style.");
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("requiredBuddyCount", guests);
            details.put("matchingBuddyCount", available.size());
            details.put("tags", criteria.getTags());
            if (criteria.getRequiredLanguage() != null) details.put("requiredLanguage", criteria.getRequiredLanguage());
            if (criteria.getGuidingStyle() != null) details.put("guidingStyle", criteria.getGuidingStyle());
            return new SearchResult(List.of(), List.of(new Reason("INSUFFICIENT_MATCHING_BUDDIES", "buddies",
                    message, Map.copyOf(details))));
        }
        List<Candidate> result = new ArrayList<>();
        BigDecimal lowestQuotedTotal = null;
        int maxAvailableBuddies = 0;
        for (ActivityDeparture departure : tourOptions) {
            Activity a = departure.getActivity();
            Set<UUID> busy = new HashSet<>(registrations.findBusyBuddyIdsInTimeRange(departure.getDepartureDate(),
                    departure.getStartTime(), departure.getEndTime(), RegistrationStatus.CANCELLED));
            var eligible = available.stream().filter(b -> !busy.contains(b.getBuddyId())).toList();
            if (eligible.size() < guests) {
                maxAvailableBuddies = Math.max(maxAvailableBuddies, eligible.size());
                reject(rejected, Rejection.BUDDY_SCHEDULE_CONFLICT, departure);
                continue;
            }
            var request = PriceQuoteRequest.builder().departureId(departure.getDepartureId())
                    .adultCount(criteria.getAdultCount()).childCount(criteria.getChildCount()).couponCode(criteria.getCouponCode()).build();
            PriceQuoteResponse quote = pricing.calculatePriceQuote(request, user);
            if (criteria.getCouponCode() != null && !Boolean.TRUE.equals(quote.getIsCouponApplied())) {
                reject(rejected, Rejection.COUPON_NOT_APPLICABLE, departure);
                continue;
            }
            if (criteria.getMaxTotalBudget() != null && quote.getTotalAmount().compareTo(criteria.getMaxTotalBudget()) > 0) {
                lowestQuotedTotal = lowestQuotedTotal == null ? quote.getTotalAmount() : lowestQuotedTotal.min(quote.getTotalAmount());
                reject(rejected, Rejection.BUDGET_TOO_LOW, departure);
                continue;
            }
            var response = ActivityDepartureResponse.builder().departureId(departure.getDepartureId()).activityId(a.getId())
                    .departureDate(departure.getDepartureDate()).startTime(departure.getStartTime()).endTime(departure.getEndTime())
                    .capacity(departure.getCapacity()).status(departure.getStatus()).build();
            int score = MatchingRules.shared(criteria.getTags(), a.getTags()).size() * 10
                    + eligible.stream().limit(guests).mapToInt(b -> MatchingRules.shared(criteria.getTags(), b.getInterests()).size()).sum();
            ActivityResponse activityResponse = activityMapper.toResponse(a);
            result.add(new Candidate(activityResponse, response, quote.getTotalAmount(),
                    eligible.stream().map(buddyMapper::toResponse).toList(), List.copyOf(activityResponse.getItineraryStops()), score));
        }
        if (result.isEmpty()) return rejectedResult(criteria, guests, rejected, lowestQuotedTotal, maxAvailableBuddies);
        return new SearchResult(result.stream().sorted(Comparator.comparingInt(Candidate::score).reversed()
                .thenComparing(c -> c.departure().getStartTime()).thenComparing(c -> c.departure().getDepartureId()))
                .limit(properties.getCandidateLimit()).toList(), List.of());
    }

    private SearchResult noDeparturesOnDate(AiMatchRequest criteria, int guests, LocalDateTime now) {
        long full = departures.countByDepartureDateAndStatus(criteria.getDate(), DepartureStatus.FULL);
        long closed = departures.countByDepartureDateAndStatus(criteria.getDate(), DepartureStatus.CLOSED);
        long cancelled = departures.countByDepartureDateAndStatus(criteria.getDate(), DepartureStatus.CANCELLED);
        List<LocalDate> dates = departures.findUpcomingMatchingDepartures(criteria.getDate(),
                criteria.getDate().plusDays(ALTERNATIVE_DATE_DAYS), DepartureStatus.AVAILABLE,
                Set.of(ActivityStatus.CANCELLED, ActivityStatus.COMPLETED), PageRequest.of(0, DEPARTURE_SEARCH_LIMIT))
                .stream().filter(d -> tourRejection(d, criteria, guests, now) == null)
                .map(ActivityDeparture::getDepartureDate).distinct().sorted().limit(5).toList();
        String message = text(criteria, "Không có ca tour còn mở ngày " + date(criteria, criteria.getDate()) + ".",
                "No open tour departure is available on " + date(criteria, criteria.getDate()) + ".");
        if (full > 0) message += text(criteria, " Ca đã hết chỗ: " + full + ".", " Fully booked departures: " + full + ".");
        if (closed > 0) message += text(criteria, " Ca đã đóng: " + closed + ".", " Closed departures: " + closed + ".");
        if (cancelled > 0) message += text(criteria, " Ca đã hủy: " + cancelled + ".", " Cancelled departures: " + cancelled + ".");
        if (!dates.isEmpty()) {
            String labels = dates.stream().map(day -> date(criteria, day)).collect(Collectors.joining(", "));
            message += text(criteria, " Có ca tour khác vào: " + labels + ". Bạn có thể đổi ngày và tìm lại.",
                    " Other tour departures are scheduled on: " + labels + ". You can change the date and search again.");
        }
        String code = full + closed + cancelled > 0 ? "NO_BOOKABLE_DEPARTURES_ON_DATE" : "NO_AVAILABLE_DEPARTURES_ON_DATE";
        return new SearchResult(List.of(), List.of(new Reason(code, "date", message,
                Map.of("requestedDate", criteria.getDate(), "availableDepartureDates", dates,
                        "fullDepartureCount", full, "closedDepartureCount", closed, "cancelledDepartureCount", cancelled))));
    }

    private Rejection tourRejection(ActivityDeparture departure, AiMatchRequest criteria, int guests, LocalDateTime now) {
        Activity activity = departure.getActivity();
        if (departure.getStatus() != DepartureStatus.AVAILABLE || activity.getStatus() == ActivityStatus.CANCELLED
                || activity.getStatus() == ActivityStatus.COMPLETED) return Rejection.TOUR_NOT_AVAILABLE;
        if (!departure.getStartDateTime().isAfter(now)) return Rejection.DEPARTURE_ALREADY_STARTED;
        if (!MatchingRules.tagsMatch(criteria.getTags(), activity.getTags(), Boolean.TRUE.equals(criteria.getRequireAllTags())))
            return Rejection.TOUR_TAG_MISMATCH;
        if (criteria.getRegion() != null && !normalize(activity.getLocationName() + " " + activity.getAddress())
                .contains(normalize(criteria.getRegion()))) return Rejection.REGION_MISMATCH;
        if ((criteria.getEarliestStartTime() != null && departure.getStartTime().isBefore(criteria.getEarliestStartTime()))
                || (criteria.getLatestEndTime() != null && departure.getEndTime().isAfter(criteria.getLatestEndTime())))
            return Rejection.TIME_WINDOW_MISMATCH;
        if (departure.getCapacity() < guests) return Rejection.INSUFFICIENT_CAPACITY;
        if (guests > (activity.getGroupMaxSize() == null ? 6 : activity.getGroupMaxSize())) return Rejection.GROUP_SIZE_LIMIT;
        int duration = (int) Duration.between(departure.getStartTime(), departure.getEndTime()).toMinutes();
        if (duration <= 0 || activity.getItineraryStops().stream()
                .anyMatch(stop -> stop.getOffsetMinutes() + stop.getDurationMinutes() > duration))
            return Rejection.ITINERARY_TIME_CONFLICT;
        return null;
    }

    private void reject(Map<Rejection, List<ActivityDeparture>> rejected, Rejection rejection, ActivityDeparture departure) {
        rejected.computeIfAbsent(rejection, key -> new ArrayList<>()).add(departure);
    }

    private SearchResult rejectedResult(AiMatchRequest criteria, int guests,
            Map<Rejection, List<ActivityDeparture>> rejected, BigDecimal lowestQuotedTotal, int maxAvailableBuddies) {
        List<Reason> reasons = new ArrayList<>();
        for (var entry : rejected.entrySet()) {
            int count = entry.getValue().size();
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("requestedDate", criteria.getDate());
            details.put("rejectedDepartureCount", count);
            String message;
            switch (entry.getKey()) {
                case TOUR_NOT_AVAILABLE -> message = text(criteria,
                        count + " ca thuộc tour đã hủy, kết thúc hoặc không còn mở bán.",
                        "Tour departures no longer open for booking: " + count + ".");
                case DEPARTURE_ALREADY_STARTED -> message = text(criteria,
                        count + " ca tour đã bắt đầu hoặc kết thúc. Hãy chọn ca có giờ bắt đầu trong tương lai.",
                        "Tour departures that have already started or ended: " + count + ". Please choose a future departure.");
                case TOUR_TAG_MISMATCH -> {
                    details.put("requestedTags", criteria.getTags());
                    message = text(criteria, count + " ca tour không khớp các chủ đề bạn chọn.",
                            "Tour departures that do not match the selected interests: " + count + ".");
                }
                case REGION_MISMATCH -> {
                    details.put("requestedRegion", criteria.getRegion());
                    message = text(criteria, count + " ca tour không có địa điểm/địa chỉ thuộc khu vực bạn nhập: " + criteria.getRegion() + ".",
                            "Tour departures outside your requested location (" + criteria.getRegion() + "): " + count + ".");
                }
                case TIME_WINDOW_MISMATCH -> {
                    if (criteria.getEarliestStartTime() != null) details.put("earliestStartTime", criteria.getEarliestStartTime());
                    if (criteria.getLatestEndTime() != null) details.put("latestEndTime", criteria.getLatestEndTime());
                    details.put("departureTimeWindows", entry.getValue().stream().map(d -> Map.of(
                            "startTime", d.getStartTime(), "endTime", d.getEndTime())).distinct().limit(5).toList());
                    message = text(criteria, count + " ca tour không nằm trọn trong khung giờ bạn yêu cầu.",
                            "Tour departures outside your requested time window: " + count + ".");
                }
                case INSUFFICIENT_CAPACITY -> {
                    int maxSeats = entry.getValue().stream().mapToInt(ActivityDeparture::getCapacity).max().orElse(0);
                    details.put("requiredSeats", guests);
                    details.put("maxRemainingSeats", maxSeats);
                    message = text(criteria, count + " ca không còn đủ " + guests + " chỗ; số chỗ còn lại lớn nhất trong các ca này là " + maxSeats + ".",
                            count + " departures do not have " + guests + " available seats; at most " + maxSeats + " seats remain in those departures.");
                }
                case GROUP_SIZE_LIMIT -> {
                    int maxGroup = entry.getValue().stream().mapToInt(d -> d.getActivity().getGroupMaxSize() == null
                            ? 6 : d.getActivity().getGroupMaxSize()).max().orElse(0);
                    details.put("requestedGuests", guests);
                    details.put("maxGroupSize", maxGroup);
                    message = text(criteria, "Nhóm " + guests + " khách vượt giới hạn của " + count + " ca tour; các ca này nhận tối đa " + maxGroup + " khách mỗi nhóm.",
                            "Your group of " + guests + " exceeds the group-size limit of " + count + " departures (maximum " + maxGroup + ").");
                }
                case ITINERARY_TIME_CONFLICT -> message = text(criteria,
                        count + " ca tour không có đủ thời lượng cho lịch trình đã công bố.",
                        "Tour departures with insufficient time for their published itinerary: " + count + ".");
                case BUDDY_SCHEDULE_CONFLICT -> {
                    details.put("requiredBuddyCount", guests);
                    details.put("maxAvailableBuddyCount", maxAvailableBuddies);
                    message = text(criteria, count + " ca chưa tìm đủ " + guests + " Buddy trống lịch; nhiều nhất tìm được " + maxAvailableBuddies + " Buddy trong các ca này.",
                            count + " departures do not have " + guests + " available Buddies; at most " + maxAvailableBuddies + " were found for those departures.");
                }
                case COUPON_NOT_APPLICABLE -> {
                    details.put("couponCode", criteria.getCouponCode());
                    message = text(criteria, "Mã giảm giá bạn nhập không áp dụng được cho " + count + " ca tour đã kiểm tra.",
                            "Your coupon cannot be applied to " + count + " of the checked departures.");
                }
                case BUDGET_TOO_LOW -> {
                    details.put("maxTotalBudget", criteria.getMaxTotalBudget());
                    details.put("lowestQuotedTotal", lowestQuotedTotal);
                    message = text(criteria, count + " ca vượt ngân sách " + money(criteria, criteria.getMaxTotalBudget())
                                    + " VND; tổng giá thấp nhất được tính là " + money(criteria, lowestQuotedTotal) + " VND.",
                            count + " departures exceed your budget of " + money(criteria, criteria.getMaxTotalBudget())
                                    + " VND; the lowest calculated total is " + money(criteria, lowestQuotedTotal) + " VND.");
                }
                default -> throw new IllegalStateException("Unhandled matching rejection");
            }
            reasons.add(new Reason(entry.getKey().name(), entry.getKey().field, message, Map.copyOf(details)));
        }
        return new SearchResult(List.of(), reasons);
    }

    private String text(AiMatchRequest criteria, String vi, String en) {
        return "en".equals(criteria.getLocale()) ? en : vi;
    }

    private String date(AiMatchRequest criteria, LocalDate day) {
        return "en".equals(criteria.getLocale()) ? day.toString() : day.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String money(AiMatchRequest criteria, BigDecimal amount) {
        NumberFormat format = NumberFormat.getNumberInstance("en".equals(criteria.getLocale()) ? Locale.US : Locale.forLanguageTag("vi-VN"));
        format.setMaximumFractionDigits(0);
        return format.format(amount);
    }

    private enum Rejection {
        TOUR_NOT_AVAILABLE("date"), DEPARTURE_ALREADY_STARTED("date"), TOUR_TAG_MISMATCH("tags"),
        REGION_MISMATCH("region"), TIME_WINDOW_MISMATCH("timeWindow"), INSUFFICIENT_CAPACITY("adultCount"),
        GROUP_SIZE_LIMIT("adultCount"), ITINERARY_TIME_CONFLICT("date"), BUDDY_SCHEDULE_CONFLICT("buddies"),
        COUPON_NOT_APPLICABLE("couponCode"), BUDGET_TOO_LOW("maxTotalBudget");

        private final String field;

        Rejection(String field) {
            this.field = field;
        }
    }

    private static String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
                .replace('đ', 'd').replace('Đ', 'D').toLowerCase(Locale.ROOT).strip();
    }
}
