# Sửa bộ lọc tag tour cho câu tự do — 30/10/2026

## Nguyên nhân

API đọc công khai của tour `1b1488bf-703a-46c4-9d89-ef36f93df397` có điểm dừng Chùa Bà và Cà Phê vợt, mô tả hoạt động uống cà phê/khám phá văn hóa. Tuy nhiên, tag tour đang lưu là `RETRO`, `FOOD`, `SNACKS`, `PHOTOGRAPHY`, `CHILL`. Câu yêu cầu tương ứng được AI bóc tách thành `CAFE`, `LOCAL_CULTURE`, `OLD_NEIGHBORHOODS`; hai tập không có phần tử chung.

Bộ lọc cũ loại tour trước khi Gemini nhận title/description/lịch trình, nên phần hiểu nghĩa đã sửa vẫn không có cơ hội đánh giá tour này. Đây là vấn đề chính sách lọc ứng viên, không cần thêm từ khóa hay quy tắc riêng cho địa danh/câu nhập.

## Quy tắc mới

| Chế độ | Tag tour | Bằng chứng trải nghiệm |
| --- | --- | --- |
| `message` có nội dung và `requiredExperiences` không rỗng, `requireAllTags=false` | Hỗ trợ xếp hạng, không loại chỉ vì thiếu tag chung | Gemini phải xác nhận đầy đủ và BE kiểm tra trích dẫn trước khi lưu |
| Chỉ chọn tag, hoặc câu nhập không có trải nghiệm cần xác minh | Phải trùng ít nhất một tag khi `requireAllTags=false` | Giữ luồng hiện tại |
| `requireAllTags=true` | Phải đủ mọi tag, kể cả câu tự do | Vẫn cần bằng chứng cho trải nghiệm nếu có |

- Sở thích Buddy vẫn phải trùng tag theo `requireAllTags`; không đổi điều kiện Buddy vì đây là tiêu chí ghép người hợp gu.
- Giữ các điều kiện về trạng thái, ngày/giờ, khu vực, sức chứa, giới hạn nhóm, lịch trình, ngôn ngữ/phong cách, lịch Buddy, giá và coupon.
- Giới hạn truy vấn/ứng viên giữ nguyên. Tour có tag chung được cộng điểm ưu tiên như trước, không tăng số tour gửi Gemini hoặc thêm lượt gọi provider.
- Context rank có `tourTagPolicy=CONTENT_VERIFIED` hoặc `REQUIRED`, dùng cùng quy tắc với bộ lọc BE. Prompt nói rõ thiếu tag không phủ nhận trải nghiệm được nội dung tour chứng minh khi ở chế độ câu tự do.
- `matchedTags` và `missingTags` giữ đúng metadata thật. Khi không có tag tour chung, không dựng dòng lý do rỗng “Chủ đề tour phù hợp: ”; lý do trải nghiệm đã xác minh vẫn hiển thị.

## Đồng bộ khi đặt tour

Bước `validateMatchedBuddies` trước đây cũng bắt tour trùng tag. Đã sửa để proposal `GEMINI` từ câu tự do có trải nghiệm được xác minh có thể đi tiếp khi tag tour không trùng.

Chính sách này được xác định bằng snapshot `criteriaJson` do BE lưu; các tag trong snapshot phải trùng tập `requestedTags` được lưu riêng. Yêu cầu `requireAllTags=true`, proposal không dùng Gemini, snapshot thiếu/lỗi hoặc không có yêu cầu ngữ nghĩa không được dùng để bỏ qua tag. Khi tour đã trùng tag theo quy tắc bình thường, giữ kiểm tra hiện có và không bắt các proposal cũ phải có dữ liệu snapshot mới.

Vẫn khóa/revalidate đúng Buddy, số lượng và ID, ngày/giờ, lịch trùng và fingerprint nội dung tour/hồ sơ. Nội dung hoặc metadata thay đổi sau khi tạo proposal vẫn bị từ chối để khách tìm lại. Không thay schema database hay cập nhật tag/nội dung tour trong DB.

## Các file đã sửa

| File | Nội dung |
| --- | --- |
| `src/main/java/com/be/service/impl/MatchingRules.java` | Quy tắc chung nhận diện tìm kiếm câu tự do và điều kiện tag tour. |
| `src/main/java/com/be/service/impl/MatchingCandidateServiceImpl.java` | Dùng chính sách mới khi tìm ca và gợi ý ngày khác. |
| `src/main/java/com/be/service/impl/GeminiMatchingClient.java` | Gửi chính sách tag tour cho rank và hướng dẫn model dùng nội dung khi metadata thiếu tag. |
| `src/main/java/com/be/service/impl/BuddyMatchingServiceImpl.java` | Dùng snapshot tiêu chí đã lưu để revalidate chính sách tour khi đặt/hoàn tất booking. Inject `ObjectMapper` theo constructor. |
| `src/main/java/com/be/service/impl/AiMatchResultStoreImpl.java` | Giữ tag thật, bỏ dòng lý do tag rỗng, ghi prompt version `smart-match-v6-semantic-tour-tags`. |
| `docs/AI-SMART-MATCHMAKER.md` | Đồng bộ quy tắc hiện hành. |

## Kiểm chứng và triển khai

- Build BE thành công với 260 file Java; còn các cảnh báo Lombok/deprecation có sẵn, không có lỗi compile ở source cuối.
- Đạt 62 kiểm tra dùng dữ liệu tour giống nội dung API đã đọc. Chạy service tìm ứng viên, matching, lưu proposal, mapper, validator và revalidate Buddy thật với repository/AI/lưu trữ giả lập.
- Kiểm tra câu tự do có ba trải nghiệm đi qua dù không trùng tag tour; vẫn cần đủ bằng chứng trước khi lưu. `matchedTags`/`missingTags` đúng dữ liệu thật, không có dòng lý do tag rỗng. Không tự fallback khi rank rỗng hoặc AI chưa cấu hình.
- Kiểm tra chế độ chỉ tag, bắt buộc đủ tag, không có trải nghiệm và Buddy không trùng sở thích; giữ kiểm tra khu vực, thời gian, chỗ, ngân sách, phong cách, ngôn ngữ và lịch Buddy. Gợi ý ngày khác dùng cùng chính sách mới.
- Kiểm tra từ tạo proposal đến `validateMatchedBuddies`, snapshot thiếu/lỗi/tag không đồng nhất, engine khác, yêu cầu đủ tag, metadata thay đổi, Buddy/lịch/ID/ngày không hợp lệ và tương thích proposal cũ có tag trùng. Không giữ chỗ/tạo booking hoặc cập nhật database thật.
- Chạy dựng request/parser `GeminiMatchingClient` với HTTP giả lập, xác nhận context dùng `CONTENT_VERIFIED`/`REQUIRED` đúng chế độ, giữ yêu cầu và không thêm lần gọi provider. Không gọi Gemini thật.
- Đã xóa thư mục test tạm cùng Java, classpath, class và log. Không thêm test vào `src/test`; giữ class ứng dụng, source và báo cáo.

Cần build/chạy lại BE hoặc deploy image BE mới. FE không cần đổi payload cho chính sách này. Quyết định ngữ nghĩa vẫn do Gemini đánh giá; việc được đưa vào danh sách ứng viên không tự bảo đảm sẽ có đề xuất. Chưa deploy VPS hoặc nghiệm thu bằng Gemini thật trong phiên này.
