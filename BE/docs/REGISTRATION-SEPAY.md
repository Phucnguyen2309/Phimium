# Registration → SePay

## Luồng mới

1. Đăng nhập bằng ACCESS JWT.
2. POST /api/v1/pricing/quote: xem giá theo departureId, adultCount, childCount, couponCode.
3. POST /api/v1/registrations: backend kiểm tra lại dữ liệu, tính lại giá từ database, giữ chỗ/coupon và lưu pickupLocation.
4. Đơn có tổng tiền > 0 trả PENDING_PAYMENT + paymentExpiresAt. Chưa ghép nhóm/Buddy.
5. POST /api/payment/registration/{registrationId}: trả checkoutUrl + fields. Gọi lặp khi còn hạn trả lại payment/invoice pending, không tạo thêm giao dịch.
6. Frontend dựng form POST với fields (giữ thứ tự) và submit đến checkoutUrl để mở SePay.
7. SePay POST IPN đến /api/webhooks/sepay, header X-Secret-Key phải khớp SEPAY_IPN_SECRET.
8. ORDER_PAID hợp lệ: đối chiếu invoice, số tiền/tiền tệ ở cả order và transaction, trạng thái CAPTURED/APPROVED và loại PAYMENT. Payment trở thành PAID; registration được đánh dấu paymentConfirmedAt, ghép nhóm theo ca và tổng khách, chuyển WAITING_FOR_BUDDY hoặc BUDDY_ASSIGNED.
9. Frontend gọi GET /api/payment/{paymentId} hoặc GET /api/v1/registrations/me để đọc trạng thái. Không tự xác nhận đã trả tiền từ URL success.
10. Hết hạn chưa thanh toán: job mỗi 30 giây hủy đơn, trả chỗ/coupon đúng một lần và đổi payment pending thành EXPIRED.

Không thêm giỏ hàng, gói tastings, phụ phí dịch vụ hay form thông tin liên hệ. Khách sạn/địa chỉ đón lưu tại pickupLocation.

## Quy tắc

- BOOKING_HOLD_MINUTES: mặc định 15 phút, không vượt giờ khởi hành.
- Adult >= 1, child >= 0; tối đa 1000 mỗi trường để tránh tràn số; tổng khách không vượt capacity và groupMaxSize (mặc định 6). Hiện mô hình một registration/một nhóm/một Buddy nên chưa tách một đơn lớn ra nhiều nhóm.
- Không đặt ca quá giờ, đóng/hủy hoặc activity đã hủy/kết thúc.
- Giá chốt từ backend; VND, làm tròn tổng và giảm giá đến đồng theo HALF_UP. Không tự quy đổi USD.
- Coupon được giữ lượt khi tạo đơn; trả lại khi hủy/hết hạn. Lock coupon ngăn nhiều ca đồng thời vượt usageLimit.
- Tổng tiền 0: xác nhận booking trực tiếp và ghép Buddy, không gửi giao dịch PURCHASE 0 đồng; vẫn có thể hủy trước khởi hành để trả chỗ/coupon.
- Một user không tạo hai registration chưa hủy cho cùng ca: lần gọi trùng trả conflict; dùng /registrations/me để lấy lại đơn đã tạo.
- Payment và registration được lock khi thay đổi, receipt lặp cùng transaction không xử lý lại.
- Check-in cần paymentConfirmedAt và BUDDY_ASSIGNED, giữ điều kiện khung giờ cũ.
- Tiền về sau khi hết hạn/hủy, ca bị hủy, hoặc thông báo TRANSACTION_VOID: payment REVIEW_REQUIRED. Không tự hồi sinh booking đã trả chỗ. VOID của đơn đã xác nhận chuyển registration PAYMENT_REVIEW và chặn check-in.
- Hủy đơn đã thanh toán trả lỗi yêu cầu review; chưa có tích hợp hoàn tiền tự động. REVIEW_REQUIRED phải được đối soát với SePay bởi người quản trị. Không tự ghi PAID thành FAILED vì khách quay về error/cancel URL.
- Không khóa phiên thanh toán bên SePay khi hết hạn local; IPN tiền về muộn được giữ để đối soát.
- Tích hợp hiện hỗ trợ BANK_TRANSFER như cấu hình cũ. Không gọi dịch vụ thật trong test.

Import collection docs/registration-sepay.postman_collection.json để thử các bước theo thứ tự. Đặt accessToken và departureId; collection tự lưu registrationId/paymentId/invoiceNumber.

## Ví dụ API

Các API ngoài webhook đều dùng Authorization: Bearer <accessToken>.

POST /api/v1/pricing/quote:
```json
{"departureId":"<UUID>","adultCount":2,"childCount":1}
```

POST /api/v1/registrations:
```json
{
  "departureId": "<UUID>",
  "adultCount": 2,
  "childCount": 1,
  "pickupLocation": "Khách sạn ABC, 123 Nguyễn Huệ, Quận 1",
  "isSafetyTermsAccepted": true
}
```

couponCode tùy chọn; pickupLocation bắt buộc, trim, tối đa 500 ký tự.
Response bọc ApiResponse, data.registrationId/data.status/data.paymentExpiresAt.

POST /api/payment/registration/<registrationId>:
```json
{"paymentMethod":"BANK_TRANSFER"}
```

Dùng data.checkoutUrl làm action form POST; data.fields thành hidden inputs. Không đưa secret key ra frontend; backend đã ký signature.

POST /api/v1/registrations/<registrationId>/cancel: hủy đơn chưa thanh toán.
GET /api/payment/<paymentId>: chỉ chủ đơn được xem payment.
GET /api/v1/registrations/me: xem booking, pickupLocation, deadline và thời điểm xác nhận tiền.

## Cấu hình SePay

Đã chuyển sepay trong application.yaml ra cấp gốc để khớp SePayProperties.

Giữ các biến hiện có:
SEPAY_MERCHANT_ID, SEPAY_SECRET_KEY, SEPAY_CHECKOUT_URL, SEPAY_API_URL,
SEPAY_SUCCESS_URL, SEPAY_ERROR_URL, SEPAY_CANCEL_URL.

Thêm:
- SEPAY_IPN_SECRET: secret dành cho IPN, đặt cùng giá trị tại SePay merchant với auth type SECRET_KEY. Không tự dùng chung signing secret.
- BOOKING_HOLD_MINUTES: tùy chọn, mặc định 15.

Nếu thiếu cấu hình bắt buộc, create payment/webhook trả lỗi rõ ràng, không chấp nhận IPN không xác thực.
Cần đưa biến vào environment JVM/IDE; app vẫn chưa tự nạp .env.

Cấu hình IPN merchant là URL HTTPS công khai /api/webhooks/sepay. Localhost cần tunnel.
Tài liệu chính thức:
- https://developer.sepay.vn/vi/cong-thanh-toan/IPN
- https://developer.sepay.vn/vi/cong-thanh-toan/API/don-hang/form-thanh-toan

Ví dụ IPN sandbox (chỉ gửi bằng test khi biết secret; production do SePay gửi):
```json
{
  "notification_type": "ORDER_PAID",
  "order": {
    "order_invoice_number": "<invoiceNumber>",
    "order_id": "<SePay order id>",
    "order_status": "CAPTURED",
    "order_currency": "VND",
    "order_amount": "250000"
  },
  "transaction": {
    "transaction_id": "<unique transaction id>",
    "transaction_type": "PAYMENT",
    "transaction_status": "APPROVED",
    "transaction_currency": "VND",
    "transaction_amount": "250000"
  }
}
```

## Database

Chạy database/registration-payment-flow.sql sau backup, với backend dừng.
Script chưa được áp dụng vào database thật.

Script bổ sung pickup_location/payment_expires_at/payment_confirmed_at, cập nhật status checks,
unique provider_transaction_id và chuyển trạng thái legacy.
- PAID thực tế được backfill confirmation; legacy CONFIRMED không tự coi là đã trả tiền.
- Đơn cũ chưa trả được chuyển PENDING_PAYMENT, bỏ group/Buddy sớm, giữ số chỗ/coupon đã trừ và thêm deadline.
- Pending payments trùng giữ một bản; receipt cũ vẫn nhận để review.
- Dừng nếu có provider transaction trùng hoặc nhiều PAID trong cùng booking; cần đối soát thủ công.
- Kiểm tra constraint tùy chỉnh trước khi chạy: script thay status CHECK hiện có.
- Legacy IN_PROGRESS/COMPLETED chưa có payment evidence cần kiểm tra riêng; không tự tạo xác nhận thanh toán.
- Các giá legacy có phần lẻ VND cần kiểm tra trước khi tiếp tục checkout; đơn mới chốt nguyên VND.

## Kiểm tra

BookingFlowTests sử dụng H2 tạm và service thật, kiểm tra registration → payment → IPN,
hủy/expiry/coupon, receipt giả/lặp, receipt muộn/VOID, ownership, nhóm và concurrent requests.

Lệnh thông thường:
`mvn -B "-Dtest=BookingFlowTests,Authentication*Tests" test`

Nếu Windows thiếu bộ nhớ, phiên kiểm tra đã dùng một JVM Maven với Xint, Xmx256m và -DforkCount=0.
Không thay cấu hình JVM production, không dùng PostgreSQL/SePay thật trong test.

Kết quả kiểm tra: 45 test đạt (29 authentication + 16 booking), không có failure/error. Sau thay đổi cuối cho hủy booking miễn phí, 16 test booking đã chạy lại và tiếp tục đạt; BUILD SUCCESS. Chưa test SePay sandbox thật hoặc chạy SQL trên PostgreSQL thật.
