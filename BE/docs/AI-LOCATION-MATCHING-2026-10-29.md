# Sửa lọc địa điểm AI matching — 29/10/2026

## Vấn đề được sửa

Khách nhập “tui muốn đi khám phá chợ bến thành và ăn uống quanh đó”. AI nhận diện Chợ Bến Thành trong `requiredExperiences` nhưng có lần trả `region: "Ho Chi Minh City"`. Bộ lọc BE cũ chỉ tìm chuỗi region trong `locationName + address` sau khi bỏ dấu/chuyển chữ thường. Địa chỉ ghi “TP.HCM” không chứa chuỗi “Ho Chi Minh City”, nên tour bị loại trước khi tới bước AI đánh giá trải nghiệm.

## Các file đã sửa

| File | Thay đổi |
| --- | --- |
| `src/main/java/com/be/service/impl/MatchingLocation.java` | Helper thuần Java cho bước lọc địa điểm: chuẩn hóa tên tương đương và đọc nguồn địa điểm trong nội dung/lịch trình tour. Không phải Spring service/bean. |
| `src/main/java/com/be/service/impl/MatchingCandidateServiceImpl.java` | Dùng helper mới cho cả tìm ca theo ngày và gợi ý ngày khác. Đổi thông báo `REGION_MISMATCH` thành chưa tìm thấy dữ kiện địa điểm khớp, tránh khẳng định tour nằm ngoài khu vực chỉ từ phép kiểm tra text. |
| `src/main/java/com/be/service/impl/GeminiMatchingClient.java` | Siết prompt: giữ địa danh cụ thể khách nói; không tự thay bằng thành phố cha; không suy diễn món Hoa/street food từ tên chợ; không đổi ăn uống chung thành bữa sáng/trưa/tối. |
| `src/main/java/com/be/service/impl/AiMatchResultStoreImpl.java` | Ghi phiên bản prompt `smart-match-v4-location-aliases` vào đề xuất mới để truy vết. |
| `docs/AI-SMART-MATCHMAKER.md` | Cập nhật quy tắc lọc địa điểm. |

## Quy tắc sau sửa

- Chuẩn hóa dấu tiếng Việt, chữ hoa/thường, khoảng trắng và dấu câu; kiểm tra ranh giới từ để tránh khớp một phần tên.
- Nhận diện các tên tương đương phổ biến: Ho Chi Minh City, Thành phố Hồ Chí Minh, TP.HCM, TP Hồ Chí Minh, TPHCM, HCMC, HCM City, Sài Gòn, Saigon. `Hồ Chí Minh`/`HCM` đứng riêng trong region hoặc thành phần địa chỉ ngăn bởi dấu phẩy/chấm phẩy được hiểu là tên thành phố. Không dùng tên người “Ho Chi Minh” trong văn bản bất kỳ làm bằng chứng cho TP.HCM.
- Chợ Lớn và Cholon là cùng địa danh. Không dịch tên riêng này thành “Lon Market”.
- Đối chiếu `Chợ <tên>` với `<tên> Market`, giữ nguyên tên riêng. Ví dụ Chợ Bến Thành ↔ Ben Thanh Market; Chợ Bình Tây ↔ Binh Tay Market. Không coi hai chợ này là một chỉ vì cùng thành phố.
- Nguồn đối chiếu gồm `locationName`, `address`, `title`, `description` và title/description từng điểm dừng, kèm các field tiếng Anh tương ứng. Mỗi nguồn được kiểm tra riêng; không ghép các mảnh tên rời từ hai field thành một địa danh.
- Bỏ qua một số cách phủ định đơn giản gần tên địa điểm, ví dụ “không ghé chợ Bến Thành” hoặc “does not visit Ben Thanh Market”. Đây chưa phải bộ phân tích phủ định/ngữ nghĩa đầy đủ.
- Region null hoặc chỉ có khoảng trắng không giới hạn khu vực. Region chỉ gồm dấu câu không được coi là khớp mọi tour.
- Nhận diện địa điểm là bước lọc sơ bộ. Gemini vẫn nhận title, description, lịch trình và `tourFacts`, rồi phải cung cấp bằng chứng cho từng trải nghiệm trước khi lưu đề xuất. Việc cùng thành phố không chứng minh tour ghé đúng chợ hoặc có món ăn khách yêu cầu.

## Ví dụ yêu cầu

```json
{
  "message": "Tui muốn khám phá chợ Bến Thành và ăn uống quanh đó",
  "date": "2026-10-30",
  "adultCount": 1,
  "childCount": 0,
  "requiredLanguage": "VI",
  "locale": "vi"
}
```

Prompt yêu cầu giữ `region` là “chợ Bến Thành”, giữ trải nghiệm ăn uống ở mức chung và không tự thêm bữa sáng hoặc street food. Đây là hướng dẫn cho model, không phải cam kết rằng mọi response của provider đều đúng. BE vẫn xử lý được các tên thành phố tương đương nếu model trả tên Anh.

## Phạm vi và triển khai

- Thay đổi nằm ở BE; FE đang có khả năng hiển thị `summary`/`reasons`, không cần sửa FE hoặc đổi request/response cho bản sửa này.
- Không đổi schema database, API key, model, timeout, retry hoặc thêm lượt gọi Gemini. Không gọi dịch vụ geocoding.
- Danh mục tên tương đương có phạm vi giới hạn nêu trên, chưa phải dữ liệu địa lý đầy đủ cho mọi thành phố, địa danh hoặc cách viết tắt.
- Giữ nguyên điều kiện tag của tour/Buddy, `requireAllTags`, ngôn ngữ, phong cách nếu được yêu cầu, trạng thái, lịch trống, sức chứa, giờ, ngân sách, coupon và bằng chứng trải nghiệm. Buddy không trùng sở thích vẫn có thể bị loại đúng theo quy tắc hiện tại.
- Cần build và chạy/deploy lại BE. Chưa triển khai lên VPS hoặc kiểm chứng với Gemini/database production trong phiên này.

## Kiểm chứng

- Maven compile offline thành công với 260 file Java. Còn các cảnh báo Lombok/deprecation có sẵn; không có lỗi compile ở source cuối cùng.
- Đạt 64 kiểm tra bằng Java tạm với repository, PricingService và HTTP client giả lập. Chạy service, mapper, parser Gemini, quá trình dựng request HTTP và kiểm chứng bằng chứng thật; không kết nối Gemini hoặc database thật.
- Các ca bao gồm tên TP.HCM Việt–Anh/viết tắt, tên chợ Việt–Anh, Chợ Lớn/Cholon, nguồn title/description/lịch trình và bản tiếng Anh, ranh giới từ, null/blank, phủ định đơn giản, không ghép mảnh tên giữa các field, đúng/sai địa danh, phản hồi `REGION_MISMATCH` Việt–Anh và ngày gợi ý.
- Chạy trọn luồng extract → tìm ứng viên → rank → kiểm chứng → lưu giả lập: địa chỉ TP.HCM với region Ho Chi Minh City đi qua được bộ lọc. Tour Chợ Lớn không được ghép cho yêu cầu Bến Thành chỉ vì cùng thành phố; bằng chứng không có trong tour và xếp hạng rỗng không tạo đề xuất.
- Xác nhận điều kiện sở thích, ngôn ngữ, phong cách, lịch Buddy, sức chứa và giá vẫn được áp dụng. Kiểm tra prompt có quy tắc giữ địa danh và không tự thêm bữa ăn/street food; kiểm tra bằng HTTP giả lập không chứng minh model thực tế sẽ luôn tuân thủ prompt.
- Đã xóa cả hai thư mục kiểm tra tạm cùng source Java, classpath, log và class kiểm tra. Không thêm test vào `src/test`, không xóa class ứng dụng trong `target/classes`.
