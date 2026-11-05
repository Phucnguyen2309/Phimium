# Tự dịch nội dung tour và lịch trình sang tiếng Anh — 28/10/2026

Khi chọn tiếng Anh, website trước đây chỉ đổi mô tả tour; tên tour, điểm hẹn, địa chỉ và nội dung các điểm dừng vẫn hiển thị tiếng Việt. Bản sửa này bổ sung bản dịch lưu trong database và dùng chúng ở các màn hình public.

## Nội dung được dịch

| Nội dung | Field nguồn | Field tiếng Anh |
| --- | --- | --- |
| Tên tour | `Activity.title` | `titleEn` |
| Mô tả tour | `Activity.description` | `descriptionEn` đã có |
| Điểm hẹn | `Activity.locationName` | `locationNameEn` |
| Địa chỉ | `Activity.address` | `addressEn` |
| Tên điểm dừng | `ItineraryStop.title` | `titleEn` |
| Mô tả điểm dừng | `ItineraryStop.description` | `descriptionEn` |

API danh sách/chi tiết tour và API lịch trình trả cả bản nguồn lẫn bản `*En`. Request tạo/sửa tour và điểm dừng cho phép nhập các field tiếng Anh tương ứng, nhưng không bắt buộc. Bản tiếng Anh admin nhập được ưu tiên và không bị tác vụ AI về trễ ghi đè.

## Luồng tự động

1. Admin tạo/sửa tour hoặc điểm dừng. Chỉ bản dịch của field có nguồn thay đổi mới bị xóa để dịch lại, trừ khi request đã cung cấp bản tiếng Anh. Các bản dịch còn đúng được giữ nguyên.
2. Sau khi transaction lưu thành công, BE xếp tác vụ dịch nền. Transaction rollback thì không gọi AI. API lưu tour không chờ Gemini.
3. Tác vụ chụp lại dữ liệu còn thiếu, gửi tối đa 8 field trong một lần gọi; nhóm theo khoảng 12.000 ký tự nguồn, field lớn hơn được gửi riêng. Nhiều field của cùng tour/điểm dừng được dịch chung để giảm request. Worker chạy tuần tự, queue tối đa 200 tác vụ lưu riêng lẻ.
4. Gemini dùng cấu hình `GEMINI_API_KEY`, `GEMINI_MODEL` hiện có. Prompt dịch thuật ngữ hoạt động, ẩm thực và đơn vị hành chính, giữ tên riêng, số nhà và dữ kiện gốc. Kết quả phải đủ đúng key, là chuỗi không rỗng và trong giới hạn cột.
5. BE chỉ mở transaction ngắn để ghi kết quả sau khi AI phản hồi. Field chỉ được cập nhật nếu nguồn vẫn giống lúc gửi và bản tiếng Anh hiện tại vẫn còn thiếu. Nội dung đã sửa, bản dịch do admin vừa nhập hoặc điểm dừng đã xóa không bị tác vụ cũ ghi đè/khôi phục.
6. Khi BE khởi động xong, tự tìm tour/điểm dừng còn thiếu bản tiếng Anh và xếp một đợt bổ sung. Các field đã dịch không gọi AI lại. Nếu provider tạm lỗi/rate limit, đợt bổ sung dừng để tránh gọi dồn cho các tour tiếp theo; có thể xếp lại sau khi provider phục hồi.
7. FE đổi ngôn ngữ bằng cách chọn field `*En` đã lưu, thiếu hoặc giá trị placeholder thì dùng nguồn tiếng Việt. GET API và nút đổi VI/EN không gọi Gemini. Nếu người dùng đang xem lúc tác vụ nền chưa xong, tải lại trang sau khi bản dịch được lưu để nhận dữ liệu mới.

Không có bảo đảm mọi nội dung luôn được dịch ngay: Gemini chưa cấu hình, quá tải, timeout hoặc trả dữ liệu không hợp lệ thì nội dung nguồn vẫn đọc được; các field còn thiếu có thể được thử lại qua API admin hoặc lần khởi động tiếp theo. Chất lượng ngôn ngữ phụ thuộc model; chưa gọi Gemini thật để nghiệm thu nội dung.

## Các file BE chính

- Entity/DTO/mapper của `Activity` và `ItineraryStop`: thêm các field tiếng Anh và trả chúng qua API.
- `service/ActivityTranslationService.java`, `service/impl/ActivityTranslationServiceImpl.java`: hợp đồng và implementation cho tác vụ dịch nền, backfill, batching và kiểm tra dữ liệu có đổi trước khi ghi.
- `config/ActivityTranslationConfig.java`: executor một worker, queue có giới hạn.
- `service/impl/GeminiMatchingClient.java`: thêm dịch nhiều field bằng JSON schema, dùng chung client/cấu hình/semaphore hiện có.
- `service/impl/ActivityServiceImpl.java`, `service/impl/ItineraryStopServiceImpl.java`, `util/EnglishTranslation.java`: giữ bản dịch admin nhập, vô hiệu bản dịch cũ khi nguồn đổi và xếp việc sau commit.
- `repository/ActivityRepository.java`: truy vấn các tour còn thiếu bản dịch ở tour hoặc lịch trình.
- `controller/AdminActivityController.java`, `service/ActivityService.java`: API xếp lại bản dịch còn thiếu; giữ đường dẫn cũ làm alias.
- `service/MatchingCandidateService.java`, `service/impl/MatchingExperienceEvidence.java`, `service/impl/MatchingFingerprint.java`: dữ kiện/fingerprint matching bao gồm bản dịch mới; địa điểm tiếng Anh vẫn không được dùng chứng minh loại ẩm thực.
- Xóa component cũ `ActivityDescriptionTranslator.java`; trách nhiệm đã chuyển vào service có interface và implementation.

## Các file FE đã sửa

- `src/features/activity/activityMapper.js`: giữ cả dữ liệu nguồn và các field tiếng Anh; thêm `getLocalizedText`/`getLocalizedActivity`, dùng lại quy tắc chọn bản dịch cho các màn hình.
- `src/pages/Home/components/FeaturedActivityCard.jsx`: tên tour, điểm hẹn, địa chỉ và alt ảnh theo ngôn ngữ.
- `src/pages/Activities/components/TourCard.jsx`: tiêu đề, địa điểm, địa chỉ, alt ảnh theo ngôn ngữ.
- `src/pages/ActivityDetail/activityDetailMapper.js`: bản hiển thị chi tiết và toàn bộ tên/mô tả điểm dừng theo ngôn ngữ; header, gallery, điểm hẹn và document title dùng dữ liệu đã chọn bản dịch.
- `src/pages/Home/homeMapper.js`: tên/địa chỉ các điểm hẹn trên bản đồ trang chủ.
- `src/pages/Activities/toursFilter.js`: bộ lọc khu vực dùng cùng bản hiển thị với danh sách; tìm kiếm có cả tên/địa chỉ tiếng Anh và tiếng Việt.
- `src/features/aiMatchmaker/AiMatchmakerModal.jsx`: tên tour trong lựa chọn matching theo ngôn ngữ hiện tại.
- `HUONG_DAN_CAU_TRUC.md`: cập nhật quy ước nội dung API song ngữ và helper dùng chung. Form admin tiếp tục giữ nội dung nguồn, không gửi ngược bản hiển thị tiếng Anh vào field tiếng Việt.

## Triển khai trên VPS

1. Cập nhật schema trước khi chạy code mới. Nếu đang dùng `spring.jpa.hibernate.ddl-auto=update` như cấu hình source, Hibernate tự thêm cột; nếu deploy quản lý schema bằng SQL, chạy file [20261028_activity_english_content.sql](migrations/20261028_activity_english_content.sql). File SQL chỉ thêm 5 cột nullable, không xóa dữ liệu nguồn.
2. Build/deploy lại cả BE và FE. Gemini vẫn dùng biến môi trường hiện có; không thêm API key trên FE.
3. BE tự xếp dịch dữ liệu cũ sau khi khởi động. Chờ tác vụ hoàn tất rồi tải lại website và chuyển sang EN.
4. Khi cần thử lại phần còn thiếu, dùng tài khoản ADMIN gọi:

```http
POST /api/v1/admin/activities/translate-content
```

Không cần body. HTTP `202` với `data` là số tour được đưa vào đợt bổ sung, **không phải số tour đã dịch xong**. `0` có thể là không có dữ liệu thiếu hoặc đang có đợt bổ sung được xếp/chạy. Đường dẫn cũ `POST /api/v1/admin/activities/translate-descriptions` vẫn dùng được và nay xếp dịch toàn bộ nội dung còn thiếu.

Log provider có `stage=translate-content`; log của service có `English tour content translation incomplete` khi chưa hoàn tất. Đợt dịch không tự thử vô hạn khi provider lỗi. Chưa đẩy code hoặc chạy tác vụ với database/VPS thật trong phiên này.

Bản dịch mới là một phần metadata matching. Những đề xuất AI tạo trước khi metadata thay đổi có thể cần tìm lại theo cơ chế kiểm chứng fingerprint hiện có.

## Kiểm chứng và dọn file

- BE compile offline thành công với source cuối cùng; còn các cảnh báo Lombok/deprecation đã có trước.
- Đạt **32 kiểm tra BE** bằng service/mapper/parser thật và repository/provider giả lập: dịch nền sau commit, rollback không gọi AI, bảo toàn bản tiếng Anh nhập tay, chỉ dịch phần thiếu, dữ liệu sửa/xóa trong lúc AI chạy, quá tải/queue đầy, response sai key/độ dài, chia batch, tiếp tục phần chưa hoàn thành, dừng backfill khi provider lỗi và xếp lại sau phục hồi, tạo/sửa tour/điểm dừng, HTTP 202, dữ kiện và fingerprint matching, JSON schema/parser dịch nhiều field.
- Hibernate parse truy vấn tìm nội dung thiếu với toàn bộ entity mapping thật; ConnectionProvider kiểm tra chặn mọi yêu cầu kết nối database. Không gọi Gemini hoặc database production để kiểm tra.
- FE production build thành công; output đặt ngoài source trong thư mục tạm.
- Đạt **16 kiểm tra render/mapper FE** với component thật: thẻ trang chủ/danh sách, địa điểm/địa chỉ, lịch trình tiếng Anh và tiếng Việt, mapper chi tiết, bản đồ, bộ lọc/tìm kiếm, bảo toàn nội dung nguồn và fallback khi bản dịch chưa hợp lệ.
- Lint trước/sau đều **56 lỗi + 4 cảnh báo có sẵn**, không có lỗi/cảnh báo mới. Khi so sánh, bỏ khác biệt số dòng trong code-frame của thông báo React vì các import mới làm dịch dòng.
- Checker i18n đạt **1002 key / 175 file**; dùng resolver Windows tạm để chạy script hiện có, không sửa script. Các file FE sửa giữ CRLF.
- `git diff --check` đạt. File Java kiểm tra, classpath, script/fixture render, JSON lint trước/sau và cả output build/render đã được xóa; xác nhận thư mục tạm không còn. Không thêm file test vào source project.
