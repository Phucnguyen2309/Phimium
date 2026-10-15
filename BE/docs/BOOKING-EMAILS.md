# Email xác nhận đặt tour

Backend tự gửi email HTML tiếng Việt tới email của tài khoản đặt tour sau khi booking được xác nhận:

- Thanh toán SePay: chỉ sau IPN hợp lệ và xác nhận booking thành công.
- Admin xác nhận thanh toán: dùng cùng luồng xác nhận.
- Tổng tiền bằng 0: gửi sau khi xác nhận trực tiếp, không cần tạo payment.
- Chưa có Buddy: mail xác nhận thông báo đang sắp xếp. Khi admin gán Buddy, backend xếp thêm mail cập nhật thông tin Buddy.

Mail có mã booking, tên tour, địa điểm/địa chỉ, thời gian khởi hành và kết thúc theo UTC+7,
điểm đón, số người lớn/trẻ em, giá trước giảm, tiền giảm, tổng tiền và trạng thái thanh toán.
Danh sách gồm toàn bộ Buddy được gán, tên/số điện thoại và phân biệt Buddy dẫn chính.
Nếu tour có itinerary stops, mail có lịch trình, thời gian từng điểm và mô tả.
Dữ liệu người dùng được escape trước khi đưa vào HTML.

## Gửi nền và thử lại

`booking_emails` là bảng mail chờ gửi. Nội dung được chụp tại thời điểm xác nhận/gán Buddy
và lưu trong cùng transaction với booking: rollback booking cũng rollback mail.
Job mặc định mỗi 10 giây lấy tối đa 20 mail đến hạn, gửi qua `EmailService` hiện có,
trên scheduler riêng để không chặn job hết hạn giữ chỗ/check-in.
Không gọi SMTP trong request thanh toán; lỗi SMTP không thay đổi kết quả thanh toán.

- Webhook lặp hoặc admin xác nhận lại không tạo thêm mail xác nhận.
- Có khóa từng mail trong lúc xử lý để nhiều worker không gửi đồng thời cùng bản ghi.
- Lỗi gửi: giữ `PENDING`, tăng `attempts`, thử lại sau 1, 2, 4, 8, 16, 32 phút rồi tối đa mỗi giờ.
- Gửi thành công: `SENT`, lưu `sent_at`. Booking đã hủy hoặc cần đối soát trước khi gửi: `SKIPPED`.
- Trước khi gửi, cập nhật lại nội dung theo booking hiện tại để tránh thông tin Buddy cũ.
  Mail cập nhật của lần phân công đã bị thay thế/bỏ gán được đánh dấu `SKIPPED`.
- SMTP không hỗ trợ exactly-once: nếu SMTP đã nhận nhưng ứng dụng mất kết nối hoặc dừng trước khi
  lưu `SENT`, lần thử lại có thể gửi trùng. Không mất hàng đợi khi khởi động lại ứng dụng.

## Cấu hình

Dùng lại các biến có sẵn: `BREVO_SMTP_LOGIN`, `BREVO_SMTP_KEY`, `MAIL_FROM`.
Địa chỉ `MAIL_FROM` phải được cho phép gửi trong tài khoản Brevo.
Đưa các biến vào environment của JVM/IDE; ứng dụng chưa tự nạp `.env`.
`BOOKING_MAIL_SCAN_MS` tùy chọn, mặc định `10000`.
SMTP có giới hạn chờ kết nối 5 giây, đọc/ghi 10 giây.

`spring.jpa.hibernate.ddl-auto=update` hiện tại sẽ tạo bảng mới khi backend khởi động.
Nếu môi trường tắt tự cập nhật schema, áp dụng `database/booking-emails.sql` trước khi triển khai.
Không backfill mail cho đơn cũ. Không cần đổi API/frontend.
