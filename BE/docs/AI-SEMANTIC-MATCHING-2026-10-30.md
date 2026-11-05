# Sửa xác minh trải nghiệm AI theo ngữ nghĩa — 30/10/2026

## Nguyên nhân

Sau khi qua bộ lọc khu vực và Buddy, yêu cầu vẫn có thể bị loại vì prompt xếp hạng và bộ kiểm chứng cũ buộc trích dẫn chứa cụm trong `evidencePhrases`. Nội dung tour có thể đáp ứng yêu cầu bằng cách diễn đạt khác, nhưng vẫn không qua phép dò chuỗi. Cùng vấn đề xuất hiện ở nhiều địa danh và trải nghiệm, không nên xử lý bằng cách thêm điều kiện cho từng câu khách nhập.

## Thay đổi chung

- Gemini đánh giá ý nghĩa của từng yêu cầu theo toàn bộ title, description, lịch trình và địa điểm thật của cùng một tour, cả Việt–Anh. Cách diễn đạt tương đương, bản dịch và nhiều nguồn trong cùng tour có thể cùng chứng minh trải nghiệm.
- Bỏ yêu cầu trích dẫn chứa nguyên cụm từ khách nói hoặc nhãn trải nghiệm. `evidencePhrases` giữ trong request/criteria để tương thích API và làm gợi ý ngữ cảnh, không còn là điều kiện quyết định matching.
- Bỏ bảng đồng nghĩa riêng cho các nền ẩm thực và việc dựng nguồn bằng chứng riêng từ `CHINESE_CUISINE`. Catalog/tag vẫn giữ nguyên, tiếp tục lọc chủ đề và sở thích như trước. Một tag không tự chứng minh món ăn, địa điểm hoặc hoạt động cụ thể.
- BE sinh mã `experience-1`, `experience-2`, ... cho từng yêu cầu khi gửi rank, tránh bắt model chép lại nguyên văn mô tả để đối chiếu.
- Model trả trạng thái hỗ trợ và các trích dẫn nguồn. Một lựa chọn chỉ được nhận khi mọi yêu cầu có trạng thái `SUPPORTED`, mỗi yêu cầu có 1–3 trích dẫn nguyên văn hợp lệ từ đúng tour. BE chặn mã yêu cầu lạ/trùng, thiếu bằng chứng, trạng thái không được xác nhận, trích dẫn bịa/sai nguồn hoặc quá giới hạn.
- Prompt extract dùng catalog sinh từ enum hiện có và các nguyên tắc chung về mức độ cụ thể. Bỏ các ví dụ địa danh/ẩm thực theo từng câu khách đã hỏi. Không thêm nhánh xử lý riêng cho câu hỏi mới.
- Không thêm lần gọi Gemini: luồng câu tự do vẫn extract một lần rồi rank một lần khi có ứng viên. Không thêm thư viện hoặc đổi model/timeout/retry.

## Định dạng nội bộ gửi Gemini

```json
{
  "requirements": [
    {"requirementId": "experience-1", "description": "Trải nghiệm khách yêu cầu"}
  ]
}
```

Mỗi phần tử bằng chứng trong một lựa chọn rank có dạng:

```json
{
  "requirementId": "experience-1",
  "status": "SUPPORTED",
  "citations": [
    {"factId": "description", "quote": "Trích nguyên văn từ mô tả tour thật"}
  ]
}
```

Hai trạng thái còn lại là `NOT_SUPPORTED` và `INSUFFICIENT_INFORMATION`; không được dùng để tạo đề xuất. Trích dẫn tối đa 800 ký tự, có thể ghép tối đa ba nguồn của cùng tour để hỗ trợ một yêu cầu. Nội dung trích dẫn giữ ngôn ngữ gốc, không dịch hoặc viết lại giả làm lời nguồn. Thay đổi định dạng này chỉ áp dụng giao tiếp nội bộ BE–Gemini, không yêu cầu FE đổi payload.

## Lý do không có kết quả

Code `UNVERIFIED_REQUIRED_EXPERIENCES` giữ để tương thích.

- `details.verificationStage = AI_RANKING`: model trả `choices=[]`. Trả `checkedCandidateCount` và yêu cầu đã gửi AI; không dò keyword để khẳng định những trải nghiệm nào không tồn tại trong database. Summary nói có tour/Buddy đáp ứng tiêu chí cơ bản nhưng chưa xác minh được đầy đủ trải nghiệm.
- `details.verificationStage = EVIDENCE_VALIDATION`: model có trả lựa chọn nhưng bằng chứng chưa đủ/hợp lệ. Trả `verifiedExperiences`, `unverifiedExperiences`, `evidenceIssues` và `candidateChecks` theo từng ứng viên; không gộp nguồn giữa các tour.
- `evidenceIssues` gồm mã yêu cầu và mã lỗi như `MISSING_EVIDENCE`, `UNKNOWN_REQUIREMENT`, `DUPLICATE_REQUIREMENT`, `MODEL_NOT_SUPPORTED`, `MODEL_INSUFFICIENT_INFORMATION`, `MISSING_ASSESSMENT`, `INVALID_CITATIONS`, `UNKNOWN_FACT`, `INVALID_QUOTE`, `QUOTE_NOT_IN_FACT`.

## Các file đã sửa

| File | Nội dung |
| --- | --- |
| `src/main/java/com/be/service/MatchingAiClient.java` | Trạng thái ngữ nghĩa, mã yêu cầu và danh sách trích dẫn nội bộ. |
| `src/main/java/com/be/service/MatchingCandidateService.java` | Giữ dữ kiện text thật, bỏ nhánh bằng chứng riêng theo tag ẩm thực. |
| `src/main/java/com/be/service/impl/GeminiMatchingClient.java` | Prompt chung, catalog động, schema/parser rank mới. |
| `src/main/java/com/be/service/impl/MatchingExperienceEvidence.java` | Xác minh nguồn trích dẫn và độ đầy đủ của đánh giá; bỏ phép dò cụm từ và bộ từ điển ẩm thực. Helper thuần Java, không phải Spring service/bean. |
| `src/main/java/com/be/service/impl/AiMatchingServiceImpl.java` | Dùng kết quả xác minh mới; phân biệt model trả rỗng với bằng chứng bị bác và trả chẩn đoán đúng bước. |
| `src/main/java/com/be/service/impl/AiMatchResultStoreImpl.java` | Ghi prompt version `smart-match-v5-semantic-evidence`. |
| `docs/AI-SMART-MATCHMAKER.md` | Đồng bộ hướng dẫn hiện hành. |

## Phạm vi và giới hạn

BE xác minh được nguồn trích dẫn và dữ liệu nghiệp vụ; quyết định hai nội dung có cùng nghĩa hay không do Gemini đánh giá. Một trích dẫn có thật không tự bảo đảm suy luận của model đúng. Không tự ghép khi model chưa xác nhận; prompt yêu cầu giữ mọi điều kiện cụ thể, nhận diện phủ định/mâu thuẫn và không lấy nội dung liên quan nhưng sai trải nghiệm làm bằng chứng. Cần nghiệm thu với model thật để đánh giá chất lượng ngữ nghĩa; kiểm thử giả lập chỉ xác nhận luồng xử lý và hợp đồng dữ liệu.

Giữ nguyên bộ lọc tag/Buddy, khu vực đã sửa trước đó, ngôn ngữ, phong cách, lịch, chỗ, giờ, giá, coupon, số Buddy và kiểm tra ID trước khi lưu. Không đổi schema database. FE hiện có đọc `summary`/`reasons`, không cần sửa FE cho thay đổi này. Cần build/chạy hoặc deploy lại BE; chưa triển khai lên VPS hoặc gọi Gemini/database thật trong phiên này.

## Kiểm chứng

- Maven compile offline thành công với 260 file Java. Các cảnh báo Lombok/deprecation có sẵn vẫn còn, không có lỗi compile ở source cuối cùng.
- Đạt 65 kiểm tra bằng Java tạm: trích dẫn thật với cách diễn đạt khác, nguồn Việt–Anh, nhiều nguồn trong cùng tour, hoạt động/nền ẩm thực không có trong bảng từ vựng riêng, ID yêu cầu, thiếu/trùng bằng chứng, trạng thái phủ định/chưa đủ dữ kiện, nguồn lạ, trích dẫn bịa/sai tour, giới hạn số/độ dài trích dẫn và trường hợp không có yêu cầu trải nghiệm.
- Chạy `AiMatchingServiceImpl` thật và parser/request builder của `GeminiMatchingClient` thật với dependency/HTTP giả lập: hai bước extract/rank, giữ đúng tour/Buddy, không lưu khi model trả rỗng hoặc bằng chứng lỗi, không lưu một phần response có ID không hợp lệ, giải thích Việt–Anh đúng bước.
- Kiểm tra context gửi catalog từ enum, mã yêu cầu và nguồn tour đầy đủ; không còn `experienceVocabulary`, bảng ẩm thực hoặc yêu cầu trích dẫn chứa cụm từ khách nói. Kiểm tra schema/trạng thái mới và parser chặn trạng thái ngoài danh sách.
- Các kiểm tra trên xác minh hợp đồng ngữ nghĩa và nguồn, không phải nghiệm thu năng lực suy luận của Gemini thật. Không gọi provider hoặc database thật trong quá trình kiểm tra.
- Đã xóa thư mục test tạm cùng Java, classpath, log và class kiểm tra; không thêm test vào `src/test`. Giữ source ứng dụng và báo cáo thay đổi.
