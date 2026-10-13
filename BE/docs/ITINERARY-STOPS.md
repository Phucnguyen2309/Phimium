# API điểm dừng của tour

Admin tạo tour trước rồi thêm từng điểm dừng và ảnh qua API riêng. Create/update tour và API matching metadata chỉ quản lý thông tin tour/tag, không nhận `itineraryStops`. Response tour và AI matching vẫn đọc lịch trình đã lưu để hiển thị cho khách.

## Cập nhật database

Dừng BE trước khi áp dụng `database/itinerary-stops.sql`, rồi chạy BE với entity mới. Database phải có bảng `activities` từ schema hiện tại. Nếu đang thiết lập Smart Matchmaker lần đầu, `database/ai-smart-matchmaker.sql` đã chứa cùng migration này.

Migration tạo bảng `itinerary_stops`, thêm index `(activity_id, stop_order)` và sao chép lịch trình cũ từ `activity_itinerary_stops` nếu bảng đó có. UUID của stop cũ được tạo xác định bằng `md5('itinerary:' || activity_id || ':' || stop_order)::uuid`, không cần extension. Nội dung, thời gian và thứ tự cũ được giữ; ảnh ban đầu là `null`.

Hai script dùng chung khóa transaction và ledger `backend_data_migrations`, key `itinerary-stops-v1`. Chỉ copy một lần trong transaction, kể cả khi lần đầu database không có bảng cũ. Chạy lại hoặc chạy cả hai script không phục hồi stop đã xóa bằng API. Bảng legacy được giữ để đối chiếu; BE mới chỉ đọc/ghi bảng `itinerary_stops`. Không xóa ledger khi triển khai lại.

Migration cũng đổi riêng FK legacy `activity_id` tham chiếu `activities(activity_id)` sang `ON DELETE CASCADE`, tìm đúng constraint theo metadata PostgreSQL và giữ nguyên tên. Khi xóa tour, các snapshot legacy của tour đó được xóa theo để FK cũ không chặn thao tác. Các snapshot của tour còn tồn tại vẫn được giữ. Bước sửa FK chạy độc lập với ledger nên áp dụng được cả khi dữ liệu đã copy trước đó.

`spring.jpa.hibernate.ddl-auto=update` có thể tự tạo bảng mới nhưng không sao chép dữ liệu cũ. Cần chạy SQL trước khi sử dụng API mới. Các script chưa được chạy trên PostgreSQL của bạn.

## Endpoints

Response dùng wrapper `ApiResponse` hiện có, dữ liệu nằm trong `data`. Các thao tác Admin dùng access token/cookie đăng nhập theo hệ thống hiện tại.

| Method / URL | Quyền | Chức năng |
| --- | --- | --- |
| `GET /api/activity/{activityId}/itinerary-stops` | Public | Danh sách điểm dừng theo thứ tự thời gian. |
| `GET /api/activity/{activityId}/itinerary-stops/{stopId}` | Public | Chi tiết một điểm dừng. |
| `POST /api/v1/admin/activities/{activityId}/itinerary-stops` | ADMIN | Thêm điểm dừng, ảnh tùy chọn. |
| `PUT /api/v1/admin/activities/{activityId}/itinerary-stops/{stopId}` | ADMIN | Sửa một điểm dừng. |
| `DELETE /api/v1/admin/activities/{activityId}/itinerary-stops/{stopId}` | ADMIN | Xóa một điểm dừng. |
| `DELETE /api/v1/admin/activities/{activityId}/itinerary-stops/{stopId}/image` | ADMIN | Bỏ ảnh của điểm dừng. |

`stopId` phải thuộc đúng `activityId` trên URL. ID của một điểm dừng giữ nguyên khi sửa nội dung, thời gian hoặc ảnh; thứ tự hiển thị có thể thay đổi theo thời gian mới.

## Tạo điểm dừng bằng multipart

Trong Swagger/Postman, gọi POST với `multipart/form-data`:

| Part | Kiểu | Nội dung |
| --- | --- | --- |
| `request` | JSON, Content-Type `application/json` | Các trường nội dung và thời gian bên dưới. |
| `image` | File, tùy chọn | Một ảnh cho điểm dừng. |

JSON part `request`:

```json
{
  "title": "Chụp ảnh kiến trúc",
  "description": "Khám phá và chụp ảnh tại điểm dừng đã xác nhận của tour",
  "offsetMinutes": 0,
  "durationMinutes": 60
}
```

Không gửi `activityId`, `stopId`, `stopOrder` hoặc `imageUrl` trong request. Backend lấy tour từ URL, tự tạo ID, xác định thứ tự và upload file để lưu URL ảnh.

Ví dụ `data` của response tạo/get/update:

```json
{
  "stopId": "UUID điểm dừng",
  "activityId": "UUID tour",
  "stopOrder": 0,
  "title": "Chụp ảnh kiến trúc",
  "description": "Khám phá và chụp ảnh tại điểm dừng đã xác nhận của tour",
  "offsetMinutes": 0,
  "durationMinutes": 60,
  "imageUrl": "URL ảnh đã upload hoặc null"
}
```

GET danh sách trả `data` là mảng các object này; tour chưa có điểm dừng trả mảng rỗng.

## Sửa và bỏ ảnh

PUT dùng cùng multipart `request`/`image`. Gửi đủ bốn trường `title`, `description`, `offsetMinutes`, `durationMinutes` cho nội dung mới. JSON có thêm `removeImage`, mặc định `false`:

```json
{
  "title": "Chụp ảnh phố cổ",
  "description": "Nội dung cập nhật đã xác nhận của tour",
  "offsetMinutes": 15,
  "durationMinutes": 45,
  "removeImage": false
}
```

- Không gửi `image` và `removeImage=false`: giữ ảnh cũ.
- Gửi `image`: upload và thay URL ảnh của điểm dừng.
- Gửi `removeImage=true`, không kèm file: bỏ URL ảnh của điểm dừng.
- Muốn bỏ ảnh mà không sửa nội dung: dùng `DELETE .../{stopId}/image`.

Không gửi đồng thời `removeImage=true` và file mới. API bỏ ảnh hoặc xóa điểm dừng không còn trả URL ảnh đó trong lịch trình; việc dọn asset trên Cloudinary không nằm trong hợp đồng API này.

## Quy tắc thời gian và dữ liệu

`title` và `description` không được trống, tối đa lần lượt 200 và 1000 ký tự. `offsetMinutes` từ 0 đến 1440, tính từ giờ ca tour khởi hành; `durationMinutes` từ 1 đến 1440. Tối đa 20 điểm dừng/tour.

Backend sắp xếp theo `offsetMinutes` rồi đánh lại `stopOrder` bắt đầu từ 0 sau khi thêm/sửa/xóa. Các khoảng thời gian không được chồng lấn; có thể có thời gian trống giữa hai điểm dừng. Thời điểm kết thúc điểm dừng cuối phải nằm trong thời lượng mọi ca tương lai chưa hủy. Khi thêm ca khởi hành, ca đó cũng phải đủ thời lượng cho chương trình hiện tại.

Ví dụ ca 15:00–18:00: điểm dừng offset 75, duration 45 chạy từ 16:15 đến 17:00. Điểm dừng tiếp theo phải bắt đầu từ offset 120 trở đi và kết thúc không quá offset 180.

Thay đổi chương trình có thể làm kết quả AI matching đã tạo không còn hợp lệ. Khách phải tìm lại khi booking báo metadata đã thay đổi; backend luôn dùng lịch trình đã lưu, không để AI tự tạo điểm đến hay ảnh.
