# Checklist triển khai AI Smart Matchmaker cho Phimium

Mục tiêu: khách nhập nhu cầu bằng câu tự nhiên hoặc tag, nhận gợi ý tour và Buddy hợp gu, sau đó đặt đúng lựa chọn đã xác nhận. Đây là checklist cho chức năng tích hợp vào sản phẩm hiện có. Các mục chưa đánh dấu là công việc cần triển khai và kiểm chứng.

Kết quả AI là một đề xuất. Khi khách tạo booking, backend phải kiểm tra lại và giữ cả chỗ tour lẫn lịch Buddy trong thời hạn thanh toán. Booking thành công phải sử dụng đúng danh sách Buddy đã giữ.

Trạng thái triển khai BE: đã thêm metadata/API quản lý, tìm kiếm Gemini và theo tag, lưu đề xuất, kiểm tra quyền và giữ đúng đội Buddy trong booking/payment. Chi tiết cấu hình, request/response và phần cần nghiệm thu nằm trong `docs/AI-SMART-MATCHMAKER.md`. Checklist bên dưới bao gồm cả FE, nhập dữ liệu và vận hành; chưa đánh dấu nghiệm thu toàn bộ vì các phần này chưa được triển khai/kiểm chứng xuyên suốt.

## 1. Chốt quy tắc nghiệp vụ

- [ ] Gợi ý dựa trên gu khách chủ động nhập: sở thích, trải nghiệm mong muốn, ngôn ngữ và phong cách dẫn tour.
- [ ] Thu thập đủ ngày đi, khoảng giờ, số người lớn/trẻ em, khu vực và ngân sách. Làm rõ ngân sách theo người hay cả đơn.
- [ ] Cho khách xem và sửa tiêu chí AI đã hiểu; thiếu thông tin quan trọng thì yêu cầu bổ sung trước khi đưa ra lựa chọn có thể đặt.
- [ ] Kết quả gồm tour, ca khởi hành, danh sách Buddy, người dẫn chính và lý do phù hợp.
- [ ] Giữ quy tắc hiện tại: số Buddy bằng tổng số khách trong đơn. Nếu thay đổi quy tắc này, cập nhật đồng bộ booking, lịch, hiển thị và kiểm thử.
- [ ] Card gợi ý chưa giữ lịch. Lịch được giữ khi backend tạo booking hợp lệ và kết thúc theo thời hạn thanh toán đang cấu hình.
- [ ] Mini-lịch trình mô tả chương trình tour đang bán; mọi điểm dừng, món ăn và hoạt động phải có trong dữ liệu tour.
- [ ] Nếu Buddy hết lịch trước khi giữ chỗ hoặc cần thay đổi sau khi xác nhận, thông báo lựa chọn mới và lấy xác nhận của khách; không âm thầm đổi người.
- [ ] Xác định quyền gọi API tìm kiếm cho khách chưa đăng nhập. Tạo booking và giữ lịch vẫn dùng xác thực, quyền USER và kiểm tra sở hữu hiện có.

## 2. Chuẩn hóa dữ liệu và migration

- [ ] Tạo danh mục tag có mã duy nhất, nhóm, nhãn Việt/Anh và trạng thái sử dụng. Dùng cùng mã giữa nhu cầu khách, tour và hồ sơ Buddy.
- [ ] Chốt danh mục ban đầu: chủ đề (chụp ảnh, ẩm thực, lịch sử, kiến trúc, văn hóa địa phương), nội dung chi tiết (ăn vặt, món Hoa, cà phê, phố cổ, di sản...) và vibe (hoài cổ, thư giãn, sôi động).
- [ ] Thêm `Activity.tags`; thêm các điểm dừng có thứ tự, nội dung trải nghiệm và thời lượng nếu hiển thị mini-lịch trình. Lịch trình phải nằm trong khung giờ ca khởi hành.
- [ ] Thêm `Buddy.interests`, `Buddy.skills`, `Buddy.languages` và `Buddy.guidingStyle`. Tách sở thích khỏi khả năng/thiết bị thực tế.
- [ ] Tag chủ đề dùng chung với sở thích Buddy; vibe của tour đối chiếu với phong cách dẫn của Buddy.
- [ ] Gắn tag và bổ sung nội dung cho tour/Buddy hiện có. Hồ sơ thiếu thông tin không được AI tự bổ sung bằng suy đoán.
- [ ] Lưu kết quả ghép phía server: tiêu chí, tour/ca, thứ tự Buddy, người dẫn chính, lý do, chủ sở hữu hoặc phiên tìm kiếm và thời điểm hết hiệu lực.
- [ ] Lưu giữ lịch Buddy liên kết booking, khung giờ, trạng thái và hạn giữ. Kết quả tìm kiếm hết hiệu lực và booking hết hạn thanh toán là hai vòng đời riêng.
- [ ] Viết migration SQL và index cho tag, kết quả ghép và giữ lịch. Quy định hành vi khi dữ liệu cũ chưa có tag; tránh làm hỏng luồng đặt tour thông thường.

## 3. API và quản lý dữ liệu

- [ ] Tạo API đọc danh mục tag; mở rộng DTO đọc/ghi tour và Buddy để nhận các trường mới.
- [ ] Cho Admin gắn tag, chỉnh chương trình tour và cập nhật hồ sơ Buddy; cho Buddy sửa hồ sơ của chính mình theo quyền được cấp.
- [ ] Tạo API tìm kiếm AI, ví dụ `POST /api/ai/matches`, với nhu cầu tự nhiên, các điều kiện chuyến đi và ngôn ngữ phản hồi.
- [ ] Trả `matchResultId` cho từng lựa chọn, tiêu chí đã hiểu, ID tour/ca, danh sách Buddy, người dẫn chính, lý do và lịch trình có nguồn dữ liệu.
- [ ] Giá vé, tổng tiền, rating, lịch và thông tin công khai trên card được backend lấy từ dữ liệu thật; không lấy các giá trị này từ câu trả lời tự sinh của model.
- [ ] Mở rộng request booking bằng `matchResultId`. Backend lấy danh sách Buddy đã lưu; không tin danh sách ID, điểm match hoặc giá do client gửi lại.
- [ ] Kiểm tra quyền dùng kết quả ghép, thời hạn, ca khởi hành, số khách và điều kiện đã xác nhận. Khi đổi các điều kiện ảnh hưởng đến ghép, cập nhật kết quả và yêu cầu khách xác nhận lại.
- [ ] Chuẩn hóa lỗi: thiếu tiêu chí, không có tour phù hợp, không đủ Buddy, kết quả hết hiệu lực, Buddy vừa hết lịch và AI tạm thời không khả dụng.

## 4. Xử lý Gemini và xếp hạng

- [ ] Gọi Gemini từ backend; cấu hình API key, model và timeout bằng biến môi trường.
- [ ] Tách nhu cầu tự nhiên thành dữ liệu có cấu trúc: tag hợp lệ, ngày/giờ, khu vực, ngôn ngữ, số khách và ngân sách. Dùng múi giờ Việt Nam cho các cách nói như hôm nay/cuối tuần.
- [ ] Xác định điều kiện bắt buộc và sở thích mềm. Không tự nới ngân sách, ngày đi hay ngôn ngữ bắt buộc khi không tìm thấy kết quả.
- [ ] Backend lọc tour/ca có thể đặt và Buddy đủ điều kiện, bao gồm tài khoản/trạng thái hợp lệ, lịch đã gán và các lượt giữ lịch chưa hết hạn.
- [ ] Chỉ đưa danh sách ứng viên phù hợp cùng DTO công khai cần thiết vào context. Không gửi entity chứa mật khẩu, token, ví hoặc dữ liệu riêng của khách khác.
- [ ] AI xếp hạng và giải thích dựa trên sở thích, kỹ năng, ngôn ngữ, phong cách và kinh nghiệm; rating/số review là tín hiệu bổ sung.
- [ ] Trả JSON theo schema. Kiểm tra ID nằm trong danh sách ứng viên, không trùng Buddy, đủ số người cần ghép và không tạo các thuộc tính/lý do không có nguồn.
- [ ] Điểm match nếu có dùng để xếp hạng; không trình bày như xác suất chắc chắn hợp gu khi chưa có cơ sở hiệu chuẩn.
- [ ] Xử lý phản hồi không hợp lệ, timeout và giới hạn API. Khi AI lỗi, cho khách sử dụng tìm kiếm/đặt tour thông thường với thông báo rõ.
- [ ] Không gọi AI trong transaction đang khóa chỗ hoặc lịch Buddy. Lưu phiên bản model/prompt và thời gian xử lý để truy vết kết quả.

## 5. Giữ lịch và booking

- [ ] Khi tạo booking, khóa dữ liệu cần thiết và kiểm tra lại toàn bộ danh sách Buddy, ca khởi hành và sức chứa.
- [ ] Giữ đủ lịch Buddy cùng chỗ tour/coupon trong một transaction; không để booking chỉ giữ được một phần danh sách.
- [ ] Các truy vấn phát hiện trùng lịch và chọn Buddy phải tính cả lượt giữ lịch hợp lệ, không chỉ đơn đã thanh toán.
- [ ] Khóa các Buddy theo thứ tự ổn định để giảm nguy cơ deadlock; không dựa vào kiểm tra lịch ở lần tìm kiếm để ngăn đặt trùng.
- [ ] Payment webhook và xác nhận thủ công sử dụng đúng danh sách đã giữ cho booking AI; không chạy lại xếp hạng rating và ghi đè kết quả.
- [ ] Tour miễn phí cũng xác nhận đúng kết quả ghép, không tạo giao dịch thanh toán giả.
- [ ] Hết hạn/hủy đơn giải phóng giữ lịch và tài nguyên đúng một lần. Scheduler chạy lại và webhook gửi lại không gây trừ/cộng hoặc gán lặp.
- [ ] Thanh toán đến sau khi hết hạn giữ đi vào luồng `PAYMENT_REVIEW` hiện có; không khôi phục lịch đã giải phóng hoặc tự gán người khác.
- [ ] Luồng đặt tour thông thường tiếp tục hoạt động. Admin phân công lại và mọi bước tự ghép phải tôn trọng booking AI cùng các lượt giữ lịch của nó.

## 6. Frontend

- [ ] Thêm điểm vào “Tìm tour theo vibe” tại Home và/hoặc Activities; hỗ trợ nhập câu tự nhiên và chọn tag từ API.
- [ ] Có các điều kiện ngày/giờ, khu vực, người lớn/trẻ em, ngân sách và ngôn ngữ; hiển thị lại tiêu chí đã hiểu để khách chỉnh.
- [ ] Card hiển thị tour, ca, giá có đơn vị rõ, Buddy dẫn chính/danh sách Buddy, lý do và mini-lịch trình dựa trên chương trình thật.
- [ ] Nút đặt truyền `matchResultId` vào luồng booking hiện có. Qua bước đăng nhập vẫn giữ được lựa chọn và được server kiểm tra lại.
- [ ] Booking hiển thị đúng Buddy đã giữ cùng thời hạn thanh toán. Nếu điều kiện thay đổi hoặc Buddy hết lịch, cho khách xác nhận lại trước khi thanh toán.
- [ ] Dashboard khách, Buddy và Admin hiển thị danh sách được gán thực tế nhất quán.
- [ ] Có loading, error, empty, không đủ Buddy và kết quả hết hiệu lực; hỗ trợ tìm lại hoặc đặt tour thông thường.
- [ ] Dùng các service và HTTP instance hiện có, cookie HttpOnly, helper route và mapper dùng chung; mọi nội dung UI có bản Việt/Anh.

## 7. Kiểm thử cần đạt

- [ ] Câu có nhiều gu như “15h, chụp ảnh retro, ăn chè người Hoa” được tách đúng; thiếu ngày hoặc tiêu chí mâu thuẫn được xử lý rõ.
- [ ] AI trả sai JSON, ID không tồn tại, Buddy trùng hoặc lý do không có dữ liệu: backend từ chối hoặc xử lý lại có giới hạn.
- [ ] Không có tour hợp gu, hết chỗ hoặc không đủ Buddy: trả trạng thái đúng và không tạo booking một phần.
- [ ] Hai khách đồng thời đặt cùng Buddy ở các ca trùng giờ: chỉ một booking giữ được lịch, kể cả thuộc hai tour khác nhau.
- [ ] Đơn nhiều khách giữ và gán đủ Buddy; hết hạn giải phóng toàn bộ danh sách.
- [ ] Thanh toán thành công, booking miễn phí và xác nhận thủ công đều giữ đúng lựa chọn; webhook gửi lặp không thay đổi Buddy.
- [ ] Hủy/hết hạn giải phóng đúng một lần; thanh toán muộn không lấy lại lịch đã được booking khác giữ.
- [ ] Đổi ca/số khách/ngân sách làm kết quả cũ không còn phù hợp phải được kiểm tra lại; sửa ID hoặc dùng kết quả người khác bị chặn.
- [ ] Gemini timeout/lỗi và hồ sơ thiếu tag không làm hỏng chức năng đặt tour thông thường.
- [ ] Chạy kiểm thử backend cho phần matching/booking/payment và các luồng liên quan đã thay đổi. Frontend chạy build, lint và kiểm tra đủ key i18n theo hướng dẫn repository.

## 8. Vận hành và nghiệm thu

- [ ] Cấu hình timeout, retry có giới hạn, hạn kết quả ghép và thời hạn giữ lịch; giới hạn request và chi phí API theo mức sử dụng dự kiến.
- [ ] Theo dõi độ trễ, lỗi model, số kết quả không hợp lệ, tỷ lệ không tìm được cặp, giữ lịch hết hạn và xung đột lịch; log không chứa API key hoặc dữ liệu riêng không cần thiết.
- [ ] Đo tỷ lệ xem gợi ý → chọn → thanh toán và phản hồi sau chuyến đi để đánh giá việc ghép có đáp ứng nhu cầu không.
- [ ] Có cách tắt riêng luồng AI khi lỗi; giữ các chức năng tìm kiếm, booking và thanh toán hiện có hoạt động.
- [ ] Cập nhật Swagger, tài liệu request/response, migration và hướng dẫn cấu hình; ghi rõ các lỗi mà frontend cần xử lý.
- [ ] Nghiệm thu xuyên suốt: nhập gu → chọn tour/Buddy → giữ lịch → thanh toán → cùng danh sách Buddy xuất hiện trên dashboard khách, Buddy và Admin.

## Các điểm sửa chính trong code hiện tại

| Phần | Công việc |
| --- | --- |
| `entity/Activity.java`, `entity/Buddy.java`, DTO và mapper | Bổ sung metadata tour và Buddy phục vụ matching. |
| Module AI mới | Chuẩn hóa nhu cầu, truy vấn ứng viên, gọi Gemini và lưu kết quả ghép. |
| `dto/request/RegistrationRequest.java`, `service/impl/RegistrationServiceImpl.java` | Nhận kết quả ghép, kiểm tra quyền/điều kiện và tạo giữ lịch khi booking. |
| `service/impl/BuddyMatchingServiceImpl.java`, `repository/RegistrationRepository.java` | Xếp hạng theo gu và kiểm tra xung đột với lịch đã gán/đang giữ. |
| `service/impl/BookingLifecycleServiceImpl.java`, các đường xác nhận payment | Xác nhận đúng danh sách đã giữ, giải phóng khi hết hạn/hủy, xử lý idempotent. |
| Home, Activities, ActivityDetail, Buddy và Admin ở FE | Nhập gu, quản lý metadata, hiển thị lựa chọn và đặt đúng kết quả. |

Lưu ý về code hiện có: `BuddyAssignment` và `BuddyAvailability` đang là class có trường JPA nhưng chưa có `@Entity`. Nếu dùng chúng cho chức năng mới, cần hoàn thiện persistence, repository và migration; không coi đây là cơ chế giữ lịch đã hoạt động.

Thứ tự triển khai: quy tắc nghiệp vụ → metadata và quản lý dữ liệu → API và matching AI → giữ lịch/booking/payment → frontend → kiểm thử đồng thời và nghiệm thu.
