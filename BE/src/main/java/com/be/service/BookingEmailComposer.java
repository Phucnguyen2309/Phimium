package com.be.service;

import com.be.constant.EmailBranding;
import com.be.entity.Buddy;
import com.be.entity.ItineraryStop;
import com.be.entity.Registration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class BookingEmailComposer {
    private static final Locale VIETNAMESE = Locale.forLanguageTag("vi-VN");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");
    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{([a-zA-Z]+)\\}\\}");
    private final String template = loadTemplate();

    public String compose(Registration registration, boolean buddyUpdate) {
        var departure = registration.getDeparture();
        var activity = departure.getActivity();
        Map<String, String> content = new HashMap<>();
        content.put("bannerCid", EmailBranding.BANNER_CONTENT_ID);
        content.put("preheader", buddyUpdate
                ? "Buddy của bạn đã sẵn sàng. Xem thông tin người đồng hành và chuyến đi."
                : "Chuyến đi đã được xác nhận. Lịch trình, điểm đón và Buddy của bạn đều có ở đây.");
        content.put("status", buddyUpdate ? "THÔNG TIN ĐỒNG HÀNH MỚI" : "ĐẶT TOUR THÀNH CÔNG");
        content.put("heading", buddyUpdate ? "Gặp Buddy của bạn." : "Hẹn bạn giữa Sài Gòn!");
        content.put("customerName", html(orElse(registration.getUser().getFullName(), "bạn")));
        content.put("intro", buddyUpdate
                ? "Người đồng hành đã được phân công cho chuyến đi của bạn. Cùng xem thông tin cập nhật bên dưới nhé."
                : "Chuyến đi của bạn đã được xác nhận. Một hành trình khám phá Sài Gòn cùng PHIMIUM đang chờ bạn.");
        content.put("tourTitle", html(activity.getTitle()));
        content.put("locationName", html(activity.getLocationName()));
        content.put("registrationId", html(registration.getRegistrationId().toString()));
        content.put("startTime", departure.getStartDateTime().format(TIME));
        content.put("startDate", departure.getStartDateTime().format(DATE));
        content.put("endTime", departure.getEndDateTime().format(TIME));
        content.put("endDate", departure.getEndDateTime().format(DATE));
        content.put("pickupLocation", html(registration.getPickupLocation()));
        content.put("pickupMapUrl", html("https://www.google.com/maps/search/?api=1&query="
                + URLEncoder.encode(orElse(registration.getPickupLocation(), activity.getAddress()), StandardCharsets.UTF_8)));

        StringBuilder details = new StringBuilder();
        detailRow(details, "Số khách", registration.getAdultCount() + " người lớn · "
                + registration.getChildCount() + " trẻ em");
        detailRow(details, "Địa điểm", activity.getLocationName());
        detailRow(details, "Địa chỉ tour", activity.getAddress());
        content.put("details", details.toString());

        var money = NumberFormat.getNumberInstance(VIETNAMESE);
        money.setMaximumFractionDigits(2);
        content.put("subtotal", money.format(registration.getSubtotal()) + " VND");
        content.put("discount", (registration.getDiscountAmount().signum() > 0 ? "−" : "")
                + money.format(registration.getDiscountAmount()) + " VND");
        content.put("total", money.format(registration.getTotalAmount()) + " VND");
        content.put("paymentStatus", registration.getTotalAmount().signum() == 0 ? "Tour miễn phí" : "Đã thanh toán");
        content.put("buddies", composeBuddies(registration));
        content.put("itinerary", composeItinerary(registration));
        return render(content);
    }

    private String composeBuddies(Registration registration) {
        var buddies = new ArrayList<>(registration.getBuddies());
        Buddy lead = registration.getBuddy();
        if (lead != null && buddies.stream().noneMatch(b -> Objects.equals(b.getBuddyId(), lead.getBuddyId()))) {
            buddies.add(lead);
        }
        buddies.sort(Comparator.comparing((Buddy b) -> lead == null || !Objects.equals(b.getBuddyId(), lead.getBuddyId()))
                .thenComparing(b -> b.getBuddyId().toString()));
        if (buddies.isEmpty()) {
            return """
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="padding:20px;background:#f2f5fc;border:1px solid #e1e7f5;border-radius:12px;">
                        <p style="margin:0 0 6px;color:#102e93;font-size:16px;font-weight:700;line-height:24px;">Buddy đang được sắp xếp</p>
                        <p style="margin:0;color:#65718a;font-size:14px;line-height:23px;">PHIMIUM sẽ gửi email cập nhật ngay khi có người đồng hành cho chuyến đi của bạn.</p>
                      </td>
                    </tr></table>
                    """;
        }
        StringBuilder cards = new StringBuilder();
        for (Buddy buddy : buddies) {
            var user = buddy.getUser();
            String name = user == null ? "Buddy PHIMIUM" : orElse(user.getFullName(), "Buddy PHIMIUM");
            String phone = user == null ? "" : orElse(user.getPhone(), "");
            String dialNumber = phone.replaceAll("[^0-9+]", "");
            String action = dialNumber.matches("\\+?[0-9]{6,15}") ? """
                    <td class="buddy-action" align="right" valign="middle" style="padding-left:12px;">
                      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#102e93" style="border-radius:8px;">
                        <a href="tel:%s" style="display:inline-block;padding:10px 14px;border:1px solid #102e93;border-radius:8px;color:#ffffff;font-size:13px;font-weight:700;line-height:18px;text-decoration:none;white-space:nowrap;">Gọi Buddy</a>
                      </td></tr></table>
                    </td>
                    """.formatted(dialNumber) : "";
            cards.append("""
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
                      <td style="padding:18px;border:1px solid #e1e7f5;border-radius:12px;">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"><tr class="buddy-row">
                          <td class="buddy-avatar" width="46" valign="top" style="width:46px;padding-right:12px;">
                            <table role="presentation" width="44" cellpadding="0" cellspacing="0"><tr><td width="44" height="44" align="center" bgcolor="#fff4b9" style="width:44px;height:44px;border-radius:22px;color:#102e93;font-size:15px;font-weight:700;">%s</td></tr></table>
                          </td>
                          <td class="buddy-info" valign="middle">
                            <p style="margin:0 0 3px;color:#1a2746;font-size:16px;font-weight:700;line-height:23px;">%s</p>
                            <p style="margin:0;color:#69758d;font-size:12px;line-height:19px;">%s</p>
                            <p style="margin:4px 0 0;color:#102e93;font-size:14px;line-height:21px;">%s</p>
                          </td>
                          %s
                        </tr></table>
                      </td>
                    </tr></table>
                    """.formatted(html(initials(name)), html(name),
                    lead != null && Objects.equals(buddy.getBuddyId(), lead.getBuddyId()) ? "Buddy dẫn chính" : "Buddy đồng hành",
                    html(orElse(phone, "Số điện thoại đang cập nhật")), action));
        }
        return cards.toString();
    }

    private String composeItinerary(Registration registration) {
        var stops = registration.getDeparture().getActivity().getItineraryStops().stream()
                .sorted(Comparator.comparing(ItineraryStop::getStopOrder)).toList();
        if (stops.isEmpty()) return "";
        StringBuilder rows = new StringBuilder();
        for (int i = 0; i < stops.size(); i++) {
            var stop = stops.get(i);
            var arrival = registration.getDeparture().getStartDateTime().plusMinutes(stop.getOffsetMinutes());
            rows.append("""
                    <tr><td valign="top" width="38" style="width:38px;padding:18px 12px 18px 0;%s">
                      <table role="presentation" width="28" cellpadding="0" cellspacing="0"><tr><td height="28" align="center" bgcolor="#fff0a1" style="height:28px;border-radius:8px;color:#102e93;font-size:12px;font-weight:700;">%02d</td></tr></table>
                    </td><td style="padding:18px 0;%s">
                      <p style="margin:0 0 5px;color:#102e93;font-size:12px;font-weight:700;line-height:19px;">%s · %d phút</p>
                      <p style="margin:0 0 5px;color:#1a2746;font-size:16px;font-weight:700;line-height:24px;">%s</p>
                      <p style="margin:0;color:#69758d;font-size:14px;line-height:23px;">%s</p>
                    </td></tr>
                    """.formatted(i == 0 ? "" : "border-top:1px solid #e1e7f5;", i + 1,
                    i == 0 ? "" : "border-top:1px solid #e1e7f5;", arrival.format(TIME), stop.getDurationMinutes(),
                    html(stop.getTitle()), html(stop.getDescription())));
        }
        return """
                <h2 style="margin:30px 0 14px;color:#16264a;font-size:20px;font-weight:700;line-height:28px;">Lịch trình khám phá</h2>
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"><tr><td style="padding:0 18px;background:#f6f8fd;border-radius:12px;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">%s</table>
                </td></tr></table>
                """.formatted(rows);
    }

    private String render(Map<String, String> content) {
        Matcher matcher = PLACEHOLDER.matcher(template);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String value = content.get(matcher.group(1));
            if (value == null) throw new IllegalStateException("Unknown booking email placeholder: " + matcher.group(1));
            matcher.appendReplacement(result, Matcher.quoteReplacement(value));
        }
        return matcher.appendTail(result).toString();
    }

    private static void detailRow(StringBuilder body, String label, String value) {
        body.append("<tr><td class=\"detail-label\" valign=\"top\" width=\"124\" style=\"width:124px;padding:12px 14px 12px 0;border-bottom:1px solid #edf0f7;color:#69758d;font-size:14px;line-height:23px;\">")
                .append(html(label)).append("</td><td style=\"padding:12px 0;border-bottom:1px solid #edf0f7;color:#24324e;font-size:14px;line-height:23px;\">")
                .append(html(value)).append("</td></tr>");
    }

    private static String initials(String name) {
        String[] words = name.strip().split("\\s+");
        String first = words[0].substring(0, words[0].offsetByCodePoints(0, 1));
        String last = words.length > 1 ? words[words.length - 1].substring(0, words[words.length - 1].offsetByCodePoints(0, 1)) : "";
        return (first + last).toUpperCase(VIETNAMESE);
    }

    private static String html(String value) {
        return HtmlUtils.htmlEscape(orElse(value, "Chưa cập nhật"), "UTF-8");
    }

    private static String orElse(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.strip();
    }

    private static String loadTemplate() {
        try {
            return new ClassPathResource(EmailBranding.BOOKING_TEMPLATE_RESOURCE).getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Could not load booking email template", e);
        }
    }
}
