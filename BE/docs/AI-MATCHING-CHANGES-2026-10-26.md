# Các thay đổi AI matching — 26/10/2026

## Vấn đề đã xử lý

Khách nhập “muốn ăn món Hàn, gà rán” nhưng chọn thêm tag `PHOTOGRAPHY`, `FOOD` vẫn nhận tour món Hoa. Trước đây tag FE gửi ghi đè tag AI hiểu; bộ lọc chỉ cần chung một tag; bước xếp hạng bị buộc chọn ít nhất một ca. Các trải nghiệm cụ thể ngoài danh mục tag không được giữ thành điều kiện độc lập.

## Hành vi mới

1. AI tách `requiredExperiences` từ nhu cầu chính của khách, kể cả món ăn, nền ẩm thực, địa điểm hoặc hoạt động không có tag riêng. Mỗi trải nghiệm có `description` và `evidencePhrases`: các cách diễn đạt tương đương Việt/Anh, không được nới “món Hàn” thành “đồ ăn” chung.
2. Tag bổ sung được hợp với tag AI hiểu thay vì ghi đè chúng. Các field ngày/giờ/số khách/ngôn ngữ/phong cách/ngân sách gửi riêng vẫn ưu tiên như trước.
3. Tag chỉ dùng lọc ứng viên sơ bộ. Trong bước xếp hạng hiện có, AI phải kiểm tra nhu cầu cụ thể với `tourFacts` lấy từ tên, mô tả và từng điểm dừng thực tế của đúng tour.
4. Mỗi trải nghiệm bắt buộc cần một trích dẫn có `experience`, `factId`, `quote`. BE kiểm tra đủ toàn bộ yêu cầu, đúng nguồn của ca đang chọn, trích dẫn tồn tại nguyên văn và chứa một cách diễn đạt tương đương đã được tách ở bước đầu. So khớp cụm từ hỗ trợ khác biệt hoa/thường, dấu tiếng Việt và ranh giới từ; dấu câu không được dùng làm bằng chứng.
5. Tag chung hoặc hồ sơ Buddy không được dùng chứng minh tour có món ăn/hoạt động cụ thể. Thông tin thiếu, bằng chứng không đầy đủ hoặc không xác minh được sẽ không tạo đề xuất cho tour đó.
6. AI được trả `choices: []`; BE trả `NO_MATCHES` thay vì ép chọn hoặc báo AI sai response. Kiểm tra ID ca, Buddy đủ điều kiện và đúng số Buddy vẫn giữ nguyên trước khi lưu bất kỳ đề xuất nào.
7. FE hiển thị `summary`, lý do từ BE và danh sách trải nghiệm đã hiểu. Không còn tự đoán nguyên nhân “hết chỗ” khi API chỉ biết chưa có lựa chọn phù hợp. Thông báo có tiếng Việt và tiếng Anh.

Không thêm vòng gọi Gemini cho từng tour: luồng có câu tự do vẫn tối đa một lần hiểu câu + một lần đánh giá/xếp hạng. Không thêm bảng hoặc migration SQL. Các yêu cầu mới được lưu trong `AiMatchResult.criteriaJson`; phiên bản prompt mới là `smart-match-v2-experiences`.

## Các file đã sửa

| File | Thay đổi |
| --- | --- |
| `BE/src/main/java/com/be/dto/request/AiMatchRequest.java` | Thêm trải nghiệm bắt buộc có các cụm từ tương đương và validation lồng nhau. |
| `BE/src/main/java/com/be/dto/response/AiMatchResponse.java` | Giữ các field cũ, bổ sung `summary` và `reasons`. |
| `BE/src/main/java/com/be/service/MatchingAiClient.java` | Kết quả xếp hạng có bằng chứng cho từng trải nghiệm; thay wildcard bằng import cụ thể. |
| `BE/src/main/java/com/be/service/MatchingCandidateService.java` | Đưa dữ kiện tour có mã nguồn riêng vào context gửi AI. |
| `BE/src/main/java/com/be/service/impl/MatchingCandidateServiceImpl.java` | Theo dõi nguyên nhân loại ca theo ngày, trạng thái, chủ đề, khu vực, giờ, chỗ, nhóm, lịch trình, Buddy, coupon và ngân sách. |
| `BE/src/main/java/com/be/repository/ActivityDepartureRepository.java` | Đếm ca FULL/CLOSED/CANCELLED ở ngày chọn và đọc các ca khác để gợi ý ngày thật. |
| `BE/src/main/java/com/be/service/impl/GeminiMatchingClient.java` | Schema/prompt giữ nhu cầu cụ thể, yêu cầu bằng chứng và cho phép không chọn ca nào; giữ chức năng dịch mô tả tour đang có. |
| `BE/src/main/java/com/be/service/impl/AiMatchingServiceImpl.java` | Hợp tag và trải nghiệm; xác minh bằng chứng trước khi lưu; trả lý do; không âm thầm dùng tag khi không thể kiểm tra trải nghiệm cụ thể. |
| `BE/src/main/java/com/be/service/impl/AiMatchResultStoreImpl.java` | Lưu phiên bản prompt mới; lý do của kết quả hợp lệ có trải nghiệm đã đáp ứng. |
| `BE/docs/AI-SMART-MATCHMAKER.md` | Đồng bộ hướng dẫn về hợp tag, trải nghiệm cụ thể và response có lý do. |
| `FE/Phimium-FE/src/features/aiMatchmaker/AiMatchmakerModal.jsx` | Hiển thị lý do và trải nghiệm từ API; nhãn số lựa chọn chỉ hiện khi `MATCHED`. |
| `FE/Phimium-FE/src/locales/vi.js` | Thêm nhãn trải nghiệm và thay fallback suy đoán bằng thông báo trung tính. |
| `FE/Phimium-FE/src/locales/en.js` | Cập nhật bản tiếng Anh tương ứng. |

## Request và response

FE vẫn gửi request hiện tại, không phải tự tạo `requiredExperiences`:

```json
{
  "message": "Tui muốn ăn đồ ăn Hàn Quốc, ăn gà rán",
  "tags": ["PHOTOGRAPHY", "FOOD"],
  "date": "2026-10-28",
  "adultCount": 1,
  "childCount": 0,
  "locale": "vi"
}
```

Ví dụ các field chính trong `data` khi chỉ có tour món Hoa, không đủ bằng chứng cho yêu cầu khách:

```json
{
  "status": "NO_MATCHES",
  "engine": "GEMINI",
  "summary": "Chưa xác minh được tour đáp ứng đồng thời các trải nghiệm bạn yêu cầu: Ẩm thực Hàn Quốc, Gà rán.",
  "reasons": [
    {
      "code": "UNVERIFIED_REQUIRED_EXPERIENCES",
      "field": "requiredExperiences",
      "message": "Chưa xác minh được tour đáp ứng đồng thời các trải nghiệm bạn yêu cầu: Ẩm thực Hàn Quốc, Gà rán.",
      "details": {
        "requiredExperiences": ["Ẩm thực Hàn Quốc", "Gà rán"],
        "date": "2026-10-28",
        "tags": ["PHOTOGRAPHY", "FOOD"]
      }
    }
  ],
  "missingFields": [],
  "choices": []
}
```

`data.criteria` vẫn được trả đầy đủ. Phần mới có dạng:

```json
{
  "requiredExperiences": [
    {
      "description": "Ẩm thực Hàn Quốc",
      "evidencePhrases": ["món Hàn", "Hàn Quốc", "Korean cuisine"]
    },
    {
      "description": "Gà rán",
      "evidencePhrases": ["gà rán", "fried chicken"]
    }
  ]
}
```

Giới hạn: tối đa 12 trải nghiệm, mỗi mô tả tối đa 200 ký tự, mỗi trải nghiệm có 1–6 cụm từ tương đương, mỗi cụm tối đa 200 ký tự.

Các reason code mới:

| Code | Ý nghĩa |
| --- | --- |
| `MISSING_REQUIRED_FIELD` | Thiếu ngày, số người lớn hoặc sở thích/tag; message là câu hỏi bổ sung theo ngôn ngữ khách. |
| `NO_ELIGIBLE_TOUR_AND_BUDDY` | Fallback cho nguồn ứng viên không có thông tin chẩn đoán. Implementation chính hiện trả các code cụ thể bên dưới. |
| `NO_RELEVANT_TOURS` | AI không chọn được tour phù hợp sau bước lọc, khi không có trải nghiệm cụ thể riêng. |
| `UNVERIFIED_REQUIRED_EXPERIENCES` | Không có lựa chọn được xác minh đáp ứng đồng thời toàn bộ trải nghiệm bắt buộc. Không có nghĩa từng trải nghiệm đều không tồn tại trong toàn database. |

`NO_MATCHES` và `NEEDS_DETAILS` vẫn là HTTP 200 / `success=true`. Các lỗi provider, cấu hình, rate limit và lỗi JSON vẫn dùng cơ chế lỗi hiện có.

## Bổ sung lý do từ bộ lọc ca tour

Khi không có ca phù hợp, `MatchingCandidateService.search` trả cả `candidates` và `reasons`. Ngày/điều kiện tour được kiểm tra trước hồ sơ Buddy, để không che mất trường hợp khách chọn ngày chưa có ca. API đưa các lý do này ra `data.reasons`; nếu chỉ có một lý do thì `data.summary` dùng luôn thông báo đó. Nếu có nhiều lý do, summary nói chưa có lựa chọn đáp ứng đồng thời các điều kiện và FE hiển thị từng lý do bên dưới.

| Code | Nội dung và dữ liệu thật trả kèm |
| --- | --- |
| `NO_AVAILABLE_DEPARTURES_ON_DATE` | Không có ca còn mở ở ngày chọn; có `requestedDate`, `availableDepartureDates`. |
| `NO_BOOKABLE_DEPARTURES_ON_DATE` | Ngày đó có ca FULL/CLOSED/CANCELLED nhưng không có ca còn mở; có số ca theo từng trạng thái. |
| `TOUR_NOT_AVAILABLE` | Ca thuộc tour đã hủy/kết thúc hoặc không còn mở. |
| `DEPARTURE_ALREADY_STARTED` | Ca đã bắt đầu hoặc kết thúc. |
| `TOUR_TAG_MISMATCH` | Ca không khớp tag theo `requireAllTags` đang chọn. |
| `REGION_MISMATCH` | Địa điểm/địa chỉ không khớp khu vực nhập. |
| `TIME_WINDOW_MISMATCH` | Ca không nằm trọn trong khung giờ yêu cầu; trả cả khung giờ yêu cầu và tối đa 5 khung giờ thật của các ca bị loại. |
| `INSUFFICIENT_CAPACITY` | Không đủ chỗ; có số chỗ yêu cầu và số chỗ còn lại lớn nhất trong các ca bị loại vì điều kiện này. |
| `GROUP_SIZE_LIMIT` | Vượt giới hạn số khách trong nhóm, tách riêng với sức chứa ca. |
| `ITINERARY_TIME_CONFLICT` | Thời lượng ca không đủ cho lịch trình đã công bố. |
| `INSUFFICIENT_MATCHING_BUDDIES` | Chưa tìm đủ hồ sơ Buddy phù hợp tag/ngôn ngữ/phong cách; có số Buddy cần và số tìm được. |
| `BUDDY_SCHEDULE_CONFLICT` | Các ca không có đủ Buddy trống lịch; có số cần và số trống lịch lớn nhất tìm được trong các ca này. |
| `COUPON_NOT_APPLICABLE` | Coupon không áp dụng được cho những ca đã kiểm tra. |
| `BUDGET_TOO_LOW` | Có số ca vượt ngân sách, ngân sách yêu cầu và tổng giá thấp nhất lấy từ PricingService. |

Ví dụ ngày chưa có ca:

```json
{
  "status": "NO_MATCHES",
  "summary": "Không có ca tour còn mở ngày 27/10/2026.",
  "reasons": [
    {
      "code": "NO_AVAILABLE_DEPARTURES_ON_DATE",
      "field": "date",
      "message": "Không có ca tour còn mở ngày 27/10/2026.",
      "details": {
        "requestedDate": "2026-10-27",
        "availableDepartureDates": [],
        "fullDepartureCount": 0,
        "closedDepartureCount": 0,
        "cancelledDepartureCount": 0
      }
    }
  ],
  "choices": []
}
```

Đếm lý do theo nguyên nhân đầu tiên khiến từng ca bị loại, không tuyên bố một nguyên nhân áp dụng cho toàn bộ database khi các ca bị loại vì những điều kiện khác nhau. Chỉ trả chẩn đoán khi không có ứng viên; không đưa lỗi của ca bị loại vào kết quả tìm thành công. Số Buddy chỉ là số hồ sơ phù hợp/trống lịch tìm được trong giới hạn truy vấn, không phải tổng số Buddy toàn hệ thống; không trả ID, tên hay booking riêng tư của người khác.

Gợi ý ngày chỉ lấy từ các ca thật trong tối đa 30 ngày kể từ ngày yêu cầu, kiểm tra tối đa 200 ca và trả tối đa 5 ngày không trùng. Các ca gợi ý phải qua điều kiện tour/tag/khu vực/giờ/chỗ/nhóm/lịch trình. Đây là ngày để khách thử tìm lại, chưa bảo đảm có Buddy trống lịch hoặc đáp ứng trải nghiệm chi tiết; các bước đó vẫn chạy khi khách tìm lại. Không tự bịa ngày hay mức giá và không thêm lần gọi Gemini cho phần giải thích này.

## Kiểm chứng và dọn file

- BE: Maven compile offline thành công. Các cảnh báo Lombok/deprecation cũ vẫn có, không phát sinh lỗi compile.
- Đạt 21 tình huống kiểm tra tích hợp bằng Java tạm, dùng `GeminiMatchingClient`, parser JSON, validator và service matching thật với HTTP client giả lập; không gọi Gemini thật hoặc database. Các ca gồm món Hàn so với tour Hoa, tour Hàn không có tag riêng, tag bổ sung, trích dẫn có thật nhưng sai trải nghiệm, trích dẫn bịa/từ tour khác, thiếu bằng chứng, Việt/Anh, không dấu, tag-only, thiếu cấu hình, ID sai, response sai, thiếu ngày, lọc kết quả hỗn hợp và cụm từ chỉ có dấu câu.
- Đạt 27 tình huống chẩn đoán bộ lọc bằng repository/PricingService giả lập, mapper và service thật: ngày không có ca, ngày hết chỗ/đóng/hủy, ca đã qua, lệch tag/khu vực/giờ, chỗ/nhóm/lịch trình, Buddy, coupon, ngân sách, nhiều lý do, kết quả thành công, ngôn ngữ và ngày gợi ý. Kiểm tra cả việc đưa lý do cụ thể/multiple reasons ra response của `AiMatchingService`. Hibernate parse truy vấn JPQL mới với entity thật trong khi ConnectionProvider chặn mọi kết nối database. Chạy lại 21 ca semantic đều đạt, tổng cộng 48 tình huống.
- FE: build production thành công, output đặt trong thư mục tạm.
- Lint FE: trước và sau đều 52 lỗi + 4 cảnh báo có sẵn; không có lỗi/cảnh báo mới trong thay đổi này.
- Kiểm tra i18n: đạt 1002 key / 175 file. Script hiện có bị lỗi import đường dẫn tuyệt đối trên Windows khi chạy trực tiếp; đã chạy chính script đó với Node resolve hook chuyển đường dẫn Windows sang file URL, không sửa script.
- Các file Java kiểm tra, classpath, JSON lint trước/sau, dữ liệu chỉnh FE tạm và thư mục build tạm được dọn sau khi kiểm tra xong. Không thêm file test vào source project.

## Triển khai và giới hạn

Cần chạy/deploy lại cả BE và FE từ source mới để website nhận thay đổi. Chưa deploy trong phiên này, chưa nghiệm thu với Gemini thật hoặc database production. Bộ kiểm tra bảo đảm nguồn và cụm từ của bằng chứng; việc hiểu ý, nhận diện phủ định và sinh cụm từ tương đương vẫn có phần dựa vào model. Cần bổ sung mô tả/lịch trình chính xác, rõ ràng để tránh loại tour hợp lệ do thiếu thông tin hoặc cách diễn đạt chưa được nhận diện.

Các thay đổi này xử lý kết quả sai nhu cầu. Không đổi model, API key, quota, retry hoặc cách ánh xạ lỗi `6002/503` trong phiên này.
