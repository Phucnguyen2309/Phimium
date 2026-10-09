# Backend AI Smart Matchmaker

Khách nhập nhu cầu hoặc chọn tag. Backend lọc ca tour còn chỗ và Buddy hoạt động, cùng sở thích, đúng ngôn ngữ/phong cách nếu được yêu cầu, không trùng lịch. Gemini hiểu câu nhập và xếp hạng các ứng viên thật. Kết quả chỉ là đề xuất; khi tạo booking mới giữ chỗ và đúng đội Buddy. Số Buddy bằng số người lớn + trẻ em theo nghiệp vụ hiện tại.

## Thiết lập

1. Áp dụng `database/ai-smart-matchmaker.sql` sau các migration authentication/booking hiện có. Đây là script PostgreSQL bổ sung, chưa được chạy trên database của bạn. Cấu hình hiện tại vẫn có `ddl-auto=update`; script cũng cung cấp index phục vụ truy vấn.
2. Admin bổ sung tag và chương trình thật cho tour; Buddy/Admin bổ sung sở thích, kỹ năng, ngôn ngữ, phong cách. Dữ liệu cũ thiếu tag không xuất hiện trong matching nhưng vẫn đặt tour thông thường được.
3. Đặt `GEMINI_API_KEY` và `GEMINI_MODEL` trong biến môi trường hoặc `.env` đang dùng của BE. Model cần hỗ trợ structured output. Không đưa key vào FE/Git. Restart BE sau khi cấu hình.

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | trống | Cấu hình Gemini; không mặc định model chưa được chọn. |
| `GEMINI_BASE_URL` | `https://generativelanguage.googleapis.com` | URL provider; chỉ thay cho môi trường kiểm thử/proxy tin cậy. |
| `GEMINI_TIMEOUT_MILLIS` | 20000 | Timeout mỗi lần gọi; nhập câu có thể gọi 2 lần: tách tiêu chí và xếp hạng. |
| `GEMINI_MAX_CONCURRENT` | 4 | Số lần gọi provider đồng thời trên mỗi instance; không xếp hàng vô hạn. |
| `MATCHING_REQUESTS_PER_MINUTE` | 6 | Giới hạn mỗi khách trên mỗi instance. |
| `MATCHING_RESULT_MINUTES` | 10 | Hạn dùng đề xuất để tạo booking. |
| `BOOKING_HOLD_MINUTES` | 15 | Hạn giữ chỗ/Buddy sau khi tạo booking; tối đa đến giờ tour bắt đầu. |
| `MATCHING_MAX_RESULTS` | 3 | Số lựa chọn trả về. |
| `MATCHING_CANDIDATE_LIMIT` | 12 | Số ca đưa cho Gemini sau khi lọc/xếp hạng bằng tag. |
| `MATCHING_BUDDY_LIMIT` | 50 | Số hồ sơ Buddy lấy từ truy vấn tag/ngôn ngữ/phong cách ban đầu. |

Không có Gemini: request chỉ dùng trường có cấu trúc vẫn chạy, trả `engine=TAG_MATCHING`. Request có `message` cần Gemini và trả lỗi cấu hình nếu thiếu. Provider lỗi không âm thầm bỏ câu nhập để trả kết quả khác.

## API dữ liệu

Mọi response dùng wrapper hiện có `ApiResponse`: dữ liệu nằm trong `data`. Access token/cookie đăng nhập theo hệ thống hiện có.

| Method / URL | Quyền | Chức năng |
| --- | --- | --- |
| `GET /api/matching/tags` | Public | Danh mục mã, nhóm, nhãn Việt/Anh và `guidingStyles`. |
| `GET /api/activity/{activityId}/matching` | Public | Tag và chương trình tour. |
| `PUT /api/v1/admin/activities/{activityId}/matching` | ADMIN | Thay toàn bộ metadata tour. |
| `PUT /api/buddies/{buddyId}/matching` | ADMIN hoặc BUDDY sở hữu hồ sơ | Thay toàn bộ metadata Buddy. |
| `POST /api/ai/matches` | USER đang hoạt động | Hiểu yêu cầu và tìm tour/đội Buddy. |

Ví dụ metadata tour:

```json
{
  "tags": ["PHOTOGRAPHY", "RETRO", "CHINESE_CUISINE"],
  "itineraryStops": [
    {"title": "Chụp ảnh kiến trúc", "description": "Nội dung đã xác nhận của tour", "offsetMinutes": 0, "durationMinutes": 60},
    {"title": "Trải nghiệm món Hoa", "description": "Điểm dừng đã có trong chương trình", "offsetMinutes": 75, "durationMinutes": 45}
  ]
}
```

Các điểm dừng theo thứ tự, không chồng lấn; offset tính từ giờ khởi hành. Tổng chương trình phải nằm trong khung giờ các ca tương lai. Có thể để itinerary rỗng khi tour chưa có chương trình chi tiết; AI không tự tạo điểm dừng. Tối đa 20 điểm dừng.

Ví dụ metadata Buddy:

```json
{
  "interests": ["PHOTOGRAPHY", "RETRO", "CHINESE_CUISINE"],
  "skills": ["Hỗ trợ chụp ảnh bằng điện thoại", "Hiểu kiến trúc Chợ Lớn"],
  "languages": ["VI", "EN"],
  "guidingStyle": "CALM"
}
```

Kỹ năng là thông tin thực tế do Buddy/Admin khai báo. Ngôn ngữ dùng mã 2–3 chữ cái, lưu uppercase. Các kiểu dẫn: `CALM`, `ENGAGING`, `INFORMATIVE`, `PHOTOGRAPHY_FOCUSED`. PUT thay toàn bộ dữ liệu này; bỏ trường collection tương đương tập rỗng, `null` không hợp lệ.

## Tìm kiếm và tạo booking

```json
{
  "message": "Muốn chụp ảnh retro và ăn chè người Hoa",
  "date": "2026-12-20",
  "earliestStartTime": "15:00:00",
  "latestEndTime": "18:00:00",
  "adultCount": 2,
  "childCount": 0,
  "region": "Chợ Lớn",
  "maxTotalBudget": 600000,
  "requiredLanguage": "VI",
  "guidingStyle": "CALM",
  "requireAllTags": false,
  "locale": "vi"
}
```

Trường có cấu trúc được ưu tiên hơn thông tin Gemini tách từ `message`. Có thể bỏ `message` và gửi `tags`. Bắt buộc có ngày, số người lớn và ít nhất một tag sau khi hiểu yêu cầu; giờ/khu vực/ngân sách/ngôn ngữ/phong cách là điều kiện tùy chọn. `maxTotalBudget` là **tổng VND cả đơn**, không phải giá mỗi người. `couponCode` có thể truyền và phải được áp dụng hợp lệ. `earliestStartTime` là giờ khởi hành sớm nhất, `latestEndTime` là giờ kết thúc muộn nhất. Tất cả theo múi giờ Việt Nam.

`requireAllTags=false` mặc định: tour và từng Buddy phải chung ít nhất một tag với khách; những tag tour chưa có được trả trong `missingTags`. `true`: tour và mọi Buddy phải có đủ tất cả tag yêu cầu. Ngôn ngữ/phong cách được gửi luôn là điều kiện bắt buộc, không tự nới khi thiếu kết quả.

Response `data`:

- `status`: `NEEDS_DETAILS`, `NO_MATCHES` hoặc `MATCHED`.
- `engine`: `GEMINI` hoặc `TAG_MATCHING`.
- `criteria`: tiêu chí đã hiểu để FE hiển thị cho khách kiểm tra/chỉnh.
- `missingFields`: tên trường cần bổ sung khi thiếu tiêu chí.
- `choices`: mỗi lựa chọn chứa `matchResultId`, `expiresAt`, `activity`, `departure`, `totalAmount`, `currency=VND`, `buddies`, `leadBuddyId`, `matchedTags`, `missingTags`, `reasons`, `itinerary`.

Giá/rating/lịch trình/hồ sơ trả về từ database và PricingService. Gemini chỉ trả thứ tự ca và ID Buddy trong danh sách đủ điều kiện. Lý do được BE dựng từ các tag thực tế; không hiển thị phần trăm hợp gu thiếu cơ sở. BE kiểm tra toàn bộ kết quả model trước khi lưu. Model/prompt version và tiêu chí được lưu với đề xuất để truy vết.

Tạo booking tại API hiện có `POST /api/v1/registrations`:

```json
{
  "matchResultId": "UUID từ choices",
  "departureId": "UUID ca trong cùng choice",
  "adultCount": 2,
  "childCount": 0,
  "pickupLocation": "Địa chỉ đón khách",
  "isSafetyTermsAccepted": true
}
```

Truyền cùng coupon đã dùng khi tìm kiếm nếu có. BE kiểm tra chủ sở hữu, hạn đề xuất, ca/giờ/số khách/coupon/giá và metadata chưa đổi, rồi khóa và giữ toàn bộ Buddy cùng chỗ/coupon trong một transaction. Khách khác giữ Buddy trước sẽ bị từ chối; cần tìm lại. Request lặp cùng proposal và điểm đón trả lại booking đã tạo, không giữ thêm lần nữa. Proposal của booking đã hủy không tái sử dụng.

`RegistrationResponse` có thêm `matchResultId` và `buddyHoldExpiresAt` (chỉ khi booking AI đang chờ thanh toán). Đây là giữ lịch tạm; `buddyAssignedAt` chỉ có sau xác nhận. Webhook SePay/xác nhận thủ công/tour miễn phí dùng đúng đội đã giữ, người đầu tiên là lead. Hết hạn/hủy giải phóng Buddy/chỗ/coupon đúng một lần. Thanh toán muộn đi vào luồng review payment hiện có. Admin không tự phân công thay đội Buddy của booking AI.

## Lỗi FE cần xử lý

| Code | Tên | Hành động |
| --- | --- | --- |
| 6001 | `AI_NOT_CONFIGURED` | Dùng tìm kiếm có cấu trúc hoặc cấu hình Gemini. |
| 6002 | `AI_UNAVAILABLE` | Báo tạm lỗi, cho thử lại hoặc tìm kiếm thông thường. |
| 6003 | `AI_INVALID_RESPONSE` | Không hiển thị/đặt dữ liệu chưa kiểm chứng. |
| 6004 | `AI_RATE_LIMITED` | Chờ rồi thử lại. |
| 6005 | `MATCH_RESULT_NOT_FOUND` | Tìm lại; gồm cả kết quả thuộc khách khác. |
| 6006 | `MATCH_RESULT_EXPIRED` | Tìm lại. |
| 6007 | `MATCH_RESULT_CHANGED` | Giá/lịch/hồ sơ/số khách thay đổi; tìm lại và xác nhận lựa chọn mới. |
| 6008 | `MATCH_RESULT_ALREADY_USED` | Kết quả đã được dùng cho booking đã hủy; tìm lại. |

`BUDDY_SCHEDULE_CONFLICT`, lỗi sức chứa/coupon và các lỗi booking/payment hiện có vẫn được dùng. `NEEDS_DETAILS`/`NO_MATCHES` là response thành công có trạng thái nghiệp vụ, không tạo booking.

## Giới hạn vận hành và nghiệm thu

Đã có timeout, chặn request theo user và giới hạn provider đồng thời; chưa có quota phân tán giữa nhiều instance. Truy vấn đầu vào giới hạn 200 ca/ngày và số Buddy theo cấu hình để kiểm soát context. Với dữ liệu lớn cần phân trang/ranking truy vấn tốt hơn và rate limiter chung. Không tự seed metadata từ suy đoán. Chưa kiểm chứng bằng Gemini thật, PostgreSQL staging hay UI end-to-end; cần cấu hình, bổ sung dữ liệu thật và nghiệm thu các phần đó trước khi bật cho khách.

API provider tham chiếu: [generateContent](https://ai.google.dev/api/generate-content), [structured output](https://ai.google.dev/gemini-api/docs/structured-output).
