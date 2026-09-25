# Địa điểm đón khi đặt tour

POST /api/v1/registrations
Authorization: Bearer <accessToken>
Content-Type: application/json

Ví dụ body (thay departureId bằng UUID ca khởi hành thực tế):

```json
{
  "departureId": "11111111-1111-1111-1111-111111111111",
  "adultCount": 2,
  "childCount": 0,
  "pickupLocation": "Khách sạn ABC, 123 Nguyễn Huệ, Quận 1, TP.HCM",
  "isSafetyTermsAccepted": true
}
```

couponCode vẫn là trường tùy chọn. pickupLocation bắt buộc, bỏ khoảng trắng đầu/cuối, tối đa 500 ký tự. Nhập tên khách sạn kèm địa chỉ hoặc địa điểm đón cụ thể.

Giá báo trước qua /api/v1/pricing/quote không yêu cầu pickupLocation. Trường này không thay đổi giá tour.

Response tạo đơn và danh sách registration trả thêm data.pickupLocation (với danh sách: trong từng phần tử). Đơn cũ không có địa điểm vẫn hoạt động, field null được bỏ khỏi JSON theo cấu hình response hiện có.

Database: chạy database/registration-pickup-location.sql trước khi triển khai nếu quản lý schema thủ công. Script chưa được áp dụng vào database hiện tại; với ddl-auto=update hiện có, Hibernate có thể tự thêm cột khi khởi động lại.

Luồng đăng ký/thanh toán đã được cập nhật tiếp; xem docs/REGISTRATION-SEPAY.md và migration registration-payment-flow.sql.
