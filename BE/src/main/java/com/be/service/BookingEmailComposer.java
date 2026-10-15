package com.be.service;

import com.be.entity.Buddy;
import com.be.entity.ItineraryStop;
import com.be.entity.Registration;
import com.be.entity.User;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Locale;
import java.util.Objects;

@Component
public class BookingEmailComposer {
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public String compose(Registration registration, boolean buddyUpdate) {
        var departure = registration.getDeparture();
        var activity = departure.getActivity();
        var money = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));
        money.setMaximumFractionDigits(2);
        StringBuilder details = new StringBuilder();
        row(details, "Mã đặt tour", registration.getRegistrationId().toString());
        row(details, "Tour", activity.getTitle());
        row(details, "Địa điểm", activity.getLocationName());
        row(details, "Địa chỉ tour", activity.getAddress());
        row(details, "Khởi hành", departure.getStartDateTime().format(DATE_TIME));
        row(details, "Kết thúc", departure.getEndDateTime().format(DATE_TIME));
        row(details, "Điểm đón của bạn", registration.getPickupLocation());
        row(details, "Số khách", registration.getAdultCount() + " người lớn, "
                + registration.getChildCount() + " trẻ em");
        row(details, "Giá tour", money.format(registration.getSubtotal()) + " VND");
        row(details, "Giảm giá", money.format(registration.getDiscountAmount()) + " VND");
        row(details, "Tổng tiền", money.format(registration.getTotalAmount()) + " VND");
        row(details, "Thanh toán", registration.getTotalAmount().signum() == 0 ? "Miễn phí" : "Đã thanh toán");

        StringBuilder guides = new StringBuilder();
        var buddies = new ArrayList<>(registration.getBuddies());
        Buddy lead = registration.getBuddy();
        if (lead != null && buddies.stream().noneMatch(b -> Objects.equals(b.getBuddyId(), lead.getBuddyId()))) {
            buddies.add(lead);
        }
        buddies.sort(Comparator.comparing((Buddy b) -> lead == null || !Objects.equals(b.getBuddyId(), lead.getBuddyId()))
                .thenComparing(b -> b.getBuddyId().toString()));
        for (Buddy buddy : buddies) {
            User user = buddy.getUser();
            boolean isLead = lead != null && Objects.equals(buddy.getBuddyId(), lead.getBuddyId());
            guides.append("<li style=\"margin-bottom:12px\"><strong>")
                    .append(html(user == null || user.getFullName() == null || user.getFullName().isBlank()
                            ? "Buddy" : user.getFullName()))
                    .append("</strong>").append(isLead ? " (Buddy dẫn chính)" : " (Buddy đồng hành)")
                    .append("<br>Điện thoại: ")
                    .append(html(user == null || user.getPhone() == null || user.getPhone().isBlank()
                            ? "Chưa cập nhật" : user.getPhone()))
                    .append("</li>");
        }
        String buddySection = buddies.isEmpty()
                ? "<p>PHIMIUM đang sắp xếp Buddy dẫn tour. Bạn sẽ nhận được email cập nhật khi có người đồng hành.</p>"
                : "<ul style=\"padding-left:20px\">" + guides + "</ul>";

        StringBuilder itinerary = new StringBuilder();
        activity.getItineraryStops().stream().sorted(Comparator.comparing(ItineraryStop::getStopOrder))
                .forEach(stop -> itinerary.append("<li style=\"margin-bottom:12px\"><strong>")
                        .append(departure.getStartDateTime().plusMinutes(stop.getOffsetMinutes()).format(DATE_TIME))
                        .append(" — ").append(html(stop.getTitle())).append("</strong> (")
                        .append(stop.getDurationMinutes()).append(" phút)<br>")
                        .append(html(stop.getDescription())).append("</li>"));
        String itinerarySection = itinerary.isEmpty() ? "" : "<h2>Lịch trình</h2><ol>" + itinerary + "</ol>";

        return """
                <!doctype html>
                <html lang="vi"><head><meta charset="UTF-8"></head>
                <body style="margin:0;background:#f4f6f8;color:#243247;font-family:Arial,sans-serif">
                  <div style="max-width:640px;margin:auto;padding:28px;background:#ffffff">
                    <p style="font-weight:bold;color:#2563eb">PHIMIUM</p>
                    <h1 style="font-size:24px">%s</h1>
                    <p>Xin chào %s,</p>
                    <p>%s</p>
                    <h2>Thông tin chuyến đi</h2>
                    <table role="presentation" style="width:100%%;border-collapse:collapse">%s</table>
                    <p>Tất cả thời gian trong email theo giờ Việt Nam (UTC+7).</p>
                    <h2>Buddy dẫn tour của bạn</h2>%s
                    %s
                    <p>Vui lòng kiểm tra điểm đón, liên hệ Buddy để thống nhất thời gian gặp và giữ mã đặt tour để check-in.</p>
                    <p>Hẹn gặp bạn trong chuyến đi!<br>Đội ngũ PHIMIUM</p>
                  </div>
                </body></html>
                """.formatted(buddyUpdate ? "Cập nhật Buddy dẫn tour" : "Đặt tour thành công!",
                html(registration.getUser().getFullName() == null || registration.getUser().getFullName().isBlank()
                        ? "bạn" : registration.getUser().getFullName()),
                buddyUpdate ? "Buddy đã được phân công cho chuyến đi của bạn. Thông tin cập nhật ở bên dưới."
                        : "Chuyến đi của bạn đã được xác nhận. Dưới đây là thông tin đặt tour và người đồng hành.",
                details, buddySection, itinerarySection);
    }

    private static void row(StringBuilder body, String label, String value) {
        body.append("<tr><th scope=\"row\" style=\"text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #e5e7eb\">")
                .append(html(label)).append("</th><td style=\"padding:10px;border-bottom:1px solid #e5e7eb\">")
                .append(html(value)).append("</td></tr>");
    }

    private static String html(String value) {
        return value == null || value.isBlank() ? "Chưa cập nhật" : HtmlUtils.htmlEscape(value, "UTF-8");
    }
}
