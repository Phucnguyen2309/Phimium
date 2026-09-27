# Quản lý booking và departure

Tất cả endpoint mới yêu cầu `Authorization: Bearer <accessToken>` của ADMIN.
Không dùng refresh token. USER/BUDDY không được đọc thông tin liên hệ qua các endpoint này.

## API

Tạo tour qua `POST /api/activity/activities` trước. Request tạo tour không còn
trường `departures` và không tự tạo ca. Lấy ID tour trả về rồi gọi API tạo ca riêng bên dưới.

| Method | Path | Chức năng |
| --- | --- | --- |
| GET | `/api/v1/admin/departures?activityId={id}&from=2026-10-01&to=2026-10-31&page=0&size=20` | Các ca theo tour/ngày, kèm số khách và chỗ trống |
| GET | `/api/v1/admin/departures/{departureId}` | Tổng hợp một ca |
| GET | `/api/v1/admin/registrations?departureId={id}&page=0&size=20` | Người đặt trong ca |
| GET | `/api/v1/admin/registrations/{registrationId}` | Chi tiết booking và liên hệ |
| POST | `/api/v1/admin/activities/{activityId}/departures` | Thêm tối đa 100 ca vào tour hiện có trong một lần gọi |
| PATCH | `/api/v1/admin/departures/{departureId}/capacity` | Đổi tổng sức chứa |

Danh sách booking hỗ trợ thêm `activityId`, `status` (RegistrationStatus).
Danh sách departure hỗ trợ `status` (DepartureStatus). Các bộ lọc kết hợp bằng AND.
Phân trang bắt đầu từ 0, size 1–100, mặc định 20. Nội dung ở `data.content`,
tổng bản ghi ở `data.totalElements`. Danh sách không có kết quả trả trang rỗng;
chi tiết ID không tồn tại trả 404. from/to bao gồm cả hai ngày, from > to trả 400.

Tạo nhiều ca (ngày giờ Việt Nam, giờ kết thúc phải sau giờ bắt đầu trong cùng ngày):

```json
[
  {
    "departureDate": "2026-10-15",
    "startTime": "13:00:00",
    "endTime": "16:00:00",
    "capacity": 20
  },
  {
    "departureDate": "2026-10-15",
    "startTime": "18:00:00",
    "endTime": "21:00:00",
    "capacity": 20
  }
]
```

Ngày giờ phải ở tương lai; tour CANCELLED/COMPLETED không được tạo ca mới. Một request là một giao dịch: nếu một ca không hợp lệ thì không tạo ca nào. Không được gửi trùng cùng ngày, giờ bắt đầu và giờ kết thúc trong một request.

Đổi sức chứa:

```json
{ "totalCapacity": 25 }
```

`totalCapacity` là tổng sức chứa mong muốn, không phải số chỗ cộng thêm.
Phạm vi 1–1.000.000. Không được giảm thấp hơn số khách đang giữ chỗ.
Chỉ chỉnh ca AVAILABLE/FULL chưa khởi hành. Thao tác khóa departure cùng cơ chế
đặt tour để tránh cập nhật chỗ trống sai khi có booking đồng thời.

## Cách đọc số liệu

- `totalBookings`: số đơn ở mọi trạng thái, bao gồm đơn hủy.
- `activeBookings`: số đơn chưa hủy; đây không phải số tài khoản khách duy nhất.
- `adultGuests`, `childGuests`: số người lớn/trẻ em của đơn chưa hủy.
- `reservedGuests`: adultGuests + childGuests, bao gồm chỗ chờ thanh toán và PAYMENT_REVIEW.
- `remainingSeats`: số chỗ còn lại (trường capacity hiện có trong database).
- `totalCapacity`: remainingSeats + reservedGuests.
- `pendingPaymentGuests`: khách thuộc PENDING_PAYMENT.
- `confirmedGuests`: khách ở các trạng thái CONFIRMED, WAITING_FOR_BUDDY,
  BUDDY_ASSIGNED, IN_PROGRESS, COMPLETED; có cả booking miễn phí, không đồng nghĩa doanh thu.
- `paymentReviewGuests`: khách thuộc PAYMENT_REVIEW, được trình bày riêng.
- `cancelledGuests`: khách thuộc đơn hủy, không chiếm chỗ.
- `countsByStatus`: số đơn, người lớn, trẻ em và tổng khách theo từng RegistrationStatus.

Ví dụ: 2 đơn, mỗi đơn 2 người lớn + 1 trẻ em => 2 booking, 6 khách.
Ca ban đầu 20 chỗ => remainingSeats 14, totalCapacity 20.
Nếu hủy một đơn => activeBookings 1, reservedGuests 3, remainingSeats 17.

Số liệu phản ánh trạng thái đã lưu. Đơn PENDING_PAYMENT vừa hết hạn vẫn giữ chỗ
đến khi tiến trình hết hạn xử lý (chu kỳ hiện tại 30 giây). API GET không tự hủy đơn.
Các lần đọc khác nhau có thể thay đổi khi có thanh toán/booking đồng thời.
Dữ liệu cũ cần đúng quy ước capacity là chỗ trống; API không tự sửa dữ liệu lịch sử sai.

## Liên hệ và thao tác booking

Mỗi dòng admin registration gồm `booking` (RegistrationResponse hiện có) và
`customer: {userId, fullName, email, phone}`. `booking.pickupLocation` là khách sạn/địa điểm đón.
Thông tin liên hệ lấy từ hồ sơ hiện tại của người đại diện đặt đơn, không phải từng
khách đi cùng; trường chưa điền có thể null.

Dùng tiếp các API quản lý đã có với token ADMIN:

- POST `/api/v1/registrations/{registrationId}/cancel`: hủy theo quy tắc nghiệp vụ hiện có;
  đơn đã thanh toán có tiền cần xử lý hoàn tiền, không tự hủy qua API này.
- GET `/api/v1/registrations/{registrationId}/buddy-candidates`: xem Buddy khả dụng.
- POST `/api/v1/registrations/{registrationId}/assign-buddy`: body `{"buddyId":"UUID"}`.

API check-in hiện có dành cho chính người đặt đơn; không cấp thêm quyền check-in cho admin trong thay đổi này.

Không sửa trạng thái booking/thanh toán tùy ý hoặc xóa đơn để giữ lịch sử giao dịch.
Thay đổi này không thêm cột DB; cần deploy code mới để có endpoint mới.
