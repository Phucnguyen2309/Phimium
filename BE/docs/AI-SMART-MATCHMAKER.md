# Backend AI Smart Matchmaker

Khách nhập nhu cầu hoặc chọn tag. Backend lọc ca tour còn chỗ và Buddy hoạt động, cùng sở thích, đúng ngôn ngữ/phong cách nếu được yêu cầu, không trùng lịch. Với câu tự do có trải nghiệm cần xác minh, tag tour dùng hỗ trợ xếp hạng; Gemini xác nhận trải nghiệm từ nội dung thật. Với tìm kiếm chỉ chọn tag hoặc `requireAllTags=true`, bộ lọc tag tour vẫn bắt buộc. Kết quả chỉ là đề xuất; khi tạo booking mới giữ chỗ và đúng đội Buddy. Số Buddy bằng số người lớn + trẻ em theo nghiệp vụ hiện tại.

## Thiết lập

1. Áp dụng `database/ai-smart-matchmaker.sql` sau các migration authentication/booking hiện có, trước khi chạy BE với entity `ItineraryStop` mới. Nếu đã áp dụng Smart Matchmaker trước đây, chạy `database/itinerary-stops.sql` để chuyển lịch trình cũ. Hai script dùng chung ledger và chỉ sao chép một lần; không xóa bảng cũ và không khôi phục điểm dừng đã xóa khi chạy lại. FK legacy được đổi sang cascade để xóa tour cũng xóa snapshot legacy của tour đó, tránh FK chặn thao tác. `ddl-auto=update` chỉ tạo schema, không chuyển dữ liệu lịch trình. Chưa chạy các script này trên database của bạn.
2. Admin bổ sung tag cho tour và chương trình thật qua API điểm dừng riêng; Buddy/Admin bổ sung sở thích, kỹ năng, ngôn ngữ, phong cách. Tour thiếu tag có thể được xét bằng nội dung trong luồng câu tự do; tìm kiếm theo tag vẫn cần metadata tương ứng. Buddy vẫn cần sở thích phù hợp theo quy tắc hiện tại.
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

Khi API trả `6002`, xem console BE ở thời điểm gọi matching. Log `Gemini matching HTTP status ...` ghi HTTP status và thông báo lỗi của provider; log `Gemini matching timeout` ghi timeout thực tế; log `Gemini matching connection error` ghi loại lỗi kết nối. `stage=extract` là bước hiểu câu nhập, `stage=rank` là bước xếp hạng tour/Buddy. Log không ghi request/header hoặc nội dung response thành công; API key trong thông báo lỗi provider được che. Không tăng timeout hay đổi model trước khi xác định dòng lỗi tương ứng.

## API dữ liệu

Mọi response dùng wrapper hiện có `ApiResponse`: dữ liệu nằm trong `data`. Access token/cookie đăng nhập theo hệ thống hiện có.

| Method / URL | Quyền | Chức năng |
| --- | --- | --- |
| `GET /api/matching/tags` | Public | Danh mục mã, nhóm, nhãn Việt/Anh và `guidingStyles`. |
| `GET /api/activity/{activityId}/matching` | Public | Tag tour. |
| `PUT /api/v1/admin/activities/{activityId}/matching` | ADMIN | Thay toàn bộ tag tour. |
| `GET /api/activity/{activityId}/itinerary-stops` | Public | Các điểm dừng và ảnh, theo thứ tự thời gian. |
| `GET /api/activity/{activityId}/itinerary-stops/{stopId}` | Public | Chi tiết một điểm dừng thuộc tour. |
| `POST /api/v1/admin/activities/{activityId}/itinerary-stops` | ADMIN | Thêm điểm dừng bằng multipart, có thể kèm ảnh. |
| `PUT /api/v1/admin/activities/{activityId}/itinerary-stops/{stopId}` | ADMIN | Sửa nội dung/thời gian/ảnh của một điểm dừng. |
| `DELETE /api/v1/admin/activities/{activityId}/itinerary-stops/{stopId}` | ADMIN | Xóa điểm dừng. |
| `DELETE /api/v1/admin/activities/{activityId}/itinerary-stops/{stopId}/image` | ADMIN | Bỏ ảnh của điểm dừng. |
| `PATCH /api/v1/admin/buddies/users/{userId}/upgrade` | ADMIN | Tạo hồ sơ Buddy và đổi role của tài khoản nhân viên từ USER sang BUDDY. |
| `PUT /api/buddies/{buddyId}/matching` | ADMIN hoặc BUDDY sở hữu hồ sơ | Thay toàn bộ metadata Buddy. |
| `POST /api/ai/matches` | USER đang hoạt động | Hiểu yêu cầu và tìm tour/đội Buddy. |

Tag có thể gửi ngay khi tạo tour bằng `POST /api/v1/admin/activities`: thêm `tags` vào JSON part `request` của multipart hiện có. Bỏ trường khi tạo tương đương tập rỗng; `null` hoặc phần tử `null` không hợp lệ.

`PUT /api/v1/admin/activities/{activityId}` cũng nhận `tags` trong JSON part `request`: bỏ trường/null giữ tag cũ; gửi `[]` xóa tag; gửi danh sách thay toàn bộ tag. Create/update tour và API matching metadata không còn nhận `itineraryStops`; tạo tour trước rồi quản lý từng điểm dừng qua API riêng. Response tour/matching vẫn có lịch trình lấy từ các điểm dừng đã lưu. Xem request multipart và quy tắc ảnh trong [ITINERARY-STOPS.md](ITINERARY-STOPS.md).

Admin lấy tài khoản nhân viên bằng `GET /api/v1/admin/users?role=USER`, chọn `userId` của nhân viên rồi gọi `PATCH /api/v1/admin/buddies/users/{userId}/upgrade`. Dùng access token/cookie của Admin để xác thực; `userId` trên URL là ID tài khoản nhân viên có role USER, không phải ID tài khoản Admin đang đăng nhập. API tự nâng cấp `PATCH /api/buddies/upgrade` cũ đã được bỏ.

Request dùng `multipart/form-data` gồm part `request` chứa JSON hồ sơ với `Content-Type: application/json` và file `image` tùy chọn. Backend đọc JSON bằng `@RequestPart("request")`. Trong Swagger, dán JSON vào ô `request` rồi chọn ảnh nếu cần; Swagger đã được khai báo encoding JSON. Trong Postman form-data, đặt key `request` kiểu Text và Content-Type của part này là `application/json`, key `image` kiểu File. Ví dụ JSON trong part `request`:

```json
{
  "interests": ["PHOTOGRAPHY", "RETRO"],
  "skills": ["Hỗ trợ chụp ảnh bằng điện thoại"],
  "languages": ["VI", "EN"],
  "guidingStyle": "PHOTOGRAPHY_FOCUSED",
  "bio": "Thích khám phá kiến trúc địa phương",
  "experience": "Kinh nghiệm dẫn tour thực tế",
  "introduction": "Giới thiệu bản thân"
}
```

Ba trường text phải có, tối đa 1000 ký tự. Các collection mới có thể bỏ qua để dùng tập rỗng. Ngôn ngữ lưu uppercase; kỹ năng bỏ khoảng trắng ở hai đầu. Wallet, rating, số review, ID và trạng thái được backend quản lý. Khi database cũ có ba cột text Buddy dài 255, áp dụng các lệnh mở rộng cột trong SQL migration trước khi gửi nội dung dài.

Backend tạo entity Buddy và đổi role tài khoản nhân viên sang BUDDY trong cùng transaction. Response trả hồ sơ Buddy: `data.userId` là ID nhân viên đã chọn, `data.buddyId` là UUID hồ sơ Buddy vừa tạo. Dùng `buddyId` này cho các API cập nhật hồ sơ/metadata Buddy sau đó.

Ví dụ metadata tag tour:

```json
{
  "tags": ["PHOTOGRAPHY", "RETRO", "CHINESE_CUISINE"]
}
```

Lịch trình được quản lý độc lập với tag, tối đa 20 điểm dừng/tour. Backend sắp xếp theo `offsetMinutes`, kiểm tra không chồng lấn và không vượt thời lượng các ca tương lai. Mỗi điểm dừng có `stopId` ổn định và `imageUrl` tùy chọn. Tour chưa có điểm dừng trả lịch trình rỗng; AI không tự tạo điểm dừng.

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

Các trường ngày/giờ/số khách/khu vực/ngân sách/ngôn ngữ/phong cách gửi riêng được ưu tiên hơn thông tin Gemini tách từ `message`. Tag gửi riêng được hợp với tag đã hiểu, không ghi đè yêu cầu trong câu nhập. Có thể bỏ `message` và gửi `tags`. Bắt buộc có ngày, số người lớn và ít nhất một tag sau khi hiểu yêu cầu; giờ/khu vực/ngân sách/ngôn ngữ/phong cách là điều kiện tùy chọn. `maxTotalBudget` là **tổng VND cả đơn**, không phải giá mỗi người. `couponCode` có thể truyền và phải được áp dụng hợp lệ. `earliestStartTime` là giờ khởi hành sớm nhất, `latestEndTime` là giờ kết thúc muộn nhất. Tất cả theo múi giờ Việt Nam.

Trải nghiệm cụ thể trong câu nhập được giữ trong `criteria.requiredExperiences`, gồm `description` và `evidencePhrases`. Tag chỉ dùng lọc sơ bộ; trùng tag chung không chứng minh tour có một món ăn, địa điểm hoặc hoạt động cụ thể. Từ bản sửa 30/10/2026, Gemini đánh giá ngữ nghĩa của yêu cầu dựa trên toàn bộ nội dung thật của cùng tour, bao gồm cách diễn đạt tương đương và bản dịch. `evidencePhrases` giữ để tương thích API và hiển thị, không còn là điều kiện bắt buộc xuất hiện trong nội dung tour. BE xác minh nguồn trích dẫn và ID trước khi lưu, không dò lại cụm từ khách nói để quyết định ý nghĩa. Nếu không có lựa chọn được xác nhận và trích dẫn hợp lệ, trả `NO_MATCHES` với `choices=[]`, `summary` và `reasons`.

Mỗi trải nghiệm có mã nội bộ `experience-1`, `experience-2`, ... để model tham chiếu; không yêu cầu model chép nguyên nhãn mô tả. Xếp hạng trả trạng thái `SUPPORTED`/`NOT_SUPPORTED`/`INSUFFICIENT_INFORMATION` và 1–3 trích dẫn cho mỗi yêu cầu được xác nhận. BE chỉ nhận lựa chọn có đầy đủ trạng thái `SUPPORTED` và mọi trích dẫn tồn tại nguyên văn trong đúng `tourFacts` của lựa chọn đó. Bỏ bảng đồng nghĩa ẩm thực riêng và nhánh dùng tag `CHINESE_CUISINE` làm bằng chứng; tag vẫn có trong catalog và bộ lọc như trước. Nguồn địa điểm có thể chứng minh nơi đến, nội dung trải nghiệm phải chứng minh hoạt động/ẩm thực tương ứng. Quyết định ngữ nghĩa phụ thuộc Gemini, không phải bảo đảm suy luận đúng tuyệt đối từ phép kiểm tra trích dẫn.

Response `UNVERIFIED_REQUIRED_EXPERIENCES.details` phân biệt `verificationStage=AI_RANKING` khi model không trả lựa chọn và `EVIDENCE_VALIDATION` khi bằng chứng bị BE bác. Nhánh đầu trả số ứng viên đã gửi AI, không dò keyword để kết luận từng trải nghiệm không có trong database. Nhánh sau có `verifiedExperiences`, `unverifiedExperiences`, `evidenceIssues` và `candidateChecks`. Không tự fallback thành matching khi model trả rỗng. Bản sửa ngữ nghĩa dùng `smart-match-v5-semantic-evidence`, sau đó được bổ sung chính sách tag tour ở bản v6 bên dưới. Xem [AI-SEMANTIC-MATCHING-2026-10-30.md](AI-SEMANTIC-MATCHING-2026-10-30.md); các báo cáo trước đó phản ánh hành vi ở thời điểm sửa tương ứng.

`requireAllTags=false` mặc định: từng Buddy phải chung ít nhất một tag với khách. Tour chỉ cần trùng tag trong chế độ tag-only hoặc khi câu nhập không có `requiredExperiences`. Khi có `message` không rỗng và `requiredExperiences`, tour có thể qua bước lọc tag để Gemini xác minh bằng nội dung, kể cả không trùng tag nào; tag vẫn tăng điểm xếp hạng. Những tag tour chưa có được trả trung thực trong `missingTags`. `requireAllTags=true`: tour và mọi Buddy vẫn phải có đủ tất cả tag yêu cầu. Ngôn ngữ/phong cách được gửi luôn là điều kiện bắt buộc, không tự nới khi thiếu kết quả.

Từ bản sửa bộ lọc tag tour 30/10/2026, bước đặt tour kiểm tra cùng chính sách dựa trên tiêu chí được BE lưu trong proposal. Chỉ proposal `GEMINI` có câu tự do và trải nghiệm cần xác minh mới được áp dụng chính sách nội dung khi không trùng tag; snapshot lỗi hoặc yêu cầu bắt buộc đủ tag không được bỏ qua. Fingerprint của tour/Buddy và các điều kiện đặt tour khác vẫn được kiểm tra. Prompt version hiện tại là `smart-match-v6-semantic-tour-tags`. Xem [AI-TOUR-TAG-FILTER-2026-10-30.md](AI-TOUR-TAG-FILTER-2026-10-30.md).

Từ bản sửa 29/10/2026, bộ lọc khu vực chuẩn hóa dấu, khoảng trắng, dấu câu và các tên tương đương phổ biến của TP.HCM/Sài Gòn/Ho Chi Minh City, Chợ Lớn/Cholon. Tên chợ Việt–Anh được đối chiếu theo dạng `Chợ <tên>` / `<tên> Market`, giữ nguyên tên riêng. Nguồn kiểm tra gồm địa điểm, địa chỉ, title, description và lịch trình ở cả hai ngôn ngữ. Đây là bước lọc sơ bộ theo dữ liệu tour, không phải dịch vụ định vị/geocoding; AI vẫn phải xác minh các trải nghiệm cụ thể trên cùng tour. Prompt giữ địa danh cụ thể khách yêu cầu, không suy ra thành phố hoặc bữa ăn chưa được nói tới. Xem [AI-LOCATION-MATCHING-2026-10-29.md](AI-LOCATION-MATCHING-2026-10-29.md).

Response `data`:

- `status`: `NEEDS_DETAILS`, `NO_MATCHES` hoặc `MATCHED`.
- `engine`: `GEMINI` hoặc `TAG_MATCHING`.
- `criteria`: tiêu chí đã hiểu để FE hiển thị cho khách kiểm tra/chỉnh.
- `missingFields`: tên trường cần bổ sung khi thiếu tiêu chí.
- `choices`: mỗi lựa chọn chứa `matchResultId`, `expiresAt`, `activity`, `departure`, `totalAmount`, `currency=VND`, `buddies`, `leadBuddyId`, `matchedTags`, `missingTags`, `reasons`, `itinerary`.
- `summary`, `reasons`: giải thích vì sao thiếu thông tin/không có kết quả. Bộ lọc trả lý do cụ thể về ngày chưa có ca, ca hết chỗ/đóng/hủy, khung giờ, tag/khu vực, sức chứa, giới hạn nhóm, lịch trình, hồ sơ/lịch Buddy, coupon và ngân sách. Một kết quả có thể có nhiều nguyên nhân cho các ca bị loại khác nhau. Ngày gợi ý và mức giá trong `details` phải lấy từ dữ liệu thật, không do Gemini bịa; ngày gợi ý chưa giữ chỗ/Buddy. Danh sách code và giới hạn truy vấn nằm trong báo cáo thay đổi 26/10/2026.

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
