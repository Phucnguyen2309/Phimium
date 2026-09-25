# PHIMIUM backend authentication

## Kết quả triển khai

Chỉ sửa backend. Một entity/table User/users lưu password (BCrypt, nullable) và googleSub (nullable, unique). Không sử dụng AuthIdentity hoặc AuthProvider; hai file nháp có thay đổi trước phiên làm việc được giữ nguyên và AuthIdentity hiện không có @Entity.

LOCAL: register → OTP → login. GOOGLE: xác minh ID token → tìm googleSub trước email → yêu cầu hoàn tất hồ sơ hoặc trả token. Trùng email với tài khoản LOCAL trả ACCOUNT_LINK_REQUIRED, không tự liên kết. Link yêu cầu ACCESS JWT và Google email trùng tài khoản hiện tại.

## Điểm sai/thiếu trong SRS và code cũ

- SRS giả định đã có refresh JWT; thực tế chỉ có generateToken/access token. Đã bổ sung refresh JWT và POST /api/auth/refresh, dùng thời hạn spring.jwt.refresh-expiration hiện có (7 ngày).
- Login cũ từ chối email đã verified do điều kiện bị đảo. Đã sửa.
- OTP sai trước đây throw exception khiến transaction rollback cả attempts. Đã sửa và thêm test database kiểm tra commit sau exception.
- SRS lấy email_verified từ Google nhưng không yêu cầu rõ phải true trước khi tạo user emailVerified=true. Backend từ chối token thiếu email/sub hoặc email_verified không phải true.
- Status hiện tại chỉ có ACTIVE/INACTIVE; chỉ ACTIVE được đăng nhập. Không thêm trạng thái onboarding vào UserStatus.
- DTO cũ nhận fullname/birthdate; DTO mới nhận fullName/birthday và giữ tên cũ làm JSON alias.
- Quy tắc số điện thoại giữ nguyên: ^0[35789]\\d{8}$, trim trước validate. Password giữ quy tắc cũ và giới hạn 72 ký tự ASCII cho BCrypt.
- Google xác minh bằng GoogleIdTokenVerifier: chữ ký, issuer, expiry, audience; không tin email/name riêng do client gửi. Tài liệu: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

## Cấu hình và triển khai database

Biến môi trường mới bắt buộc: GOOGLE_CLIENT_ID (OAuth client ID của ứng dụng). Đặt trong environment của JVM hoặc cấu hình chạy IDE; việc chỉ ghi vào .env không tự bảo đảm Spring đọc nó.

Giữ TOKEN_SECRET_KEY (Base64, đủ mạnh cho HS256), TOKEN_EXPIRE_MS (mặc định 86400000), DB_* và Brevo/MAIL_FROM hiện có. Refresh dùng spring.jwt.refresh-expiration=604800000; onboarding 600000 ms.

Chạy database/authentication-migration.sql trước khi khởi động bản mới trên database cũ, sau khi backup và dừng backend. Script chưa được áp dụng vào database của bạn. Dự án chưa dùng Flyway; đây là migration PostgreSQL thủ công, không tự chạy.

Thay đổi users:
- Thêm google_sub, profile_completed.
- email NOT NULL UNIQUE; google_sub và phone UNIQUE khi có giá trị.
- email_verified/profile_completed BOOLEAN NOT NULL DEFAULT false.
- password, phone, birthday, full_name cho phép NULL để tạo tài khoản Google chưa hoàn tất.
- role/status chuyển từ ordinal sang chuỗi: USER=0, BUDDY=1, ADMIN=2; ACTIVE=0, INACTIVE=1 theo enum hiện tại.
- Mapping full_name, created_at, updated_at rõ ràng; tên Java createdAt/updatedAt.
- Normalize email và phone cũ; backfill profile_completed theo họ tên/ngày sinh quá khứ/phone. Không tự xác minh email.

Migration dừng nếu email bị thiếu hoặc trùng sau normalize, phone trùng, role/status không hợp lệ. Cần giải quyết dữ liệu này thủ công; không tự gộp/xóa tài khoản. Kiểm tra các constraint tùy chỉnh của database trước khi chạy. Local user cũ thiếu hồ sơ sẽ không đăng nhập được sau backfill; cần bổ sung dữ liệu hợp lệ qua quy trình quản trị hiện tại. Hibernate ddl-auto=update không thay thế migration này.

JWT cũ không có tokenType sẽ bị từ chối sau nâng cấp; người dùng cần đăng nhập lại. Response chỉ trả accessToken và refreshToken; đã bỏ field token trùng lặp. Client sử dụng data.accessToken.

## API và Postman

Import docs/authentication.postman_collection.json. Đặt baseUrl, otp từ email và googleCredential là Google ID token thật dành cho GOOGLE_CLIENT_ID. Collection tự lưu token từ response thành biến. Các response vẫn dùng ApiResponse; dữ liệu nằm trong data.

Tất cả request dùng Content-Type: application/json.

| POST endpoint | Authorization | Body |
| --- | --- | --- |
| /api/auth/register | Không | email, password, fullName, birthday, phone |
| /api/auth/verify-otp | Không | email, otp |
| /api/auth/resend-otp | Không | email |
| /api/auth/login | Không | email, password |
| /api/auth/google | Không | credential |
| /api/auth/complete-profile | Bearer ONBOARDING | fullName, birthday, phone |
| /api/auth/link/google | Bearer ACCESS | credential |
| /api/auth/refresh | Không | refreshToken |
| /api/auth/logout | Bearer ACCESS | Không |

Register:
```json
{"email":"abc@gmail.com","password":"Password123!","fullName":"Nguyen Van A","birthday":"2002-05-10","phone":"0912345678"}
```

Verify OTP:
```json
{"email":"abc@gmail.com","otp":"483921"}
```

Login:
```json
{"email":"abc@gmail.com","password":"Password123!"}
```

Google auth / link:
```json
{"credential":"GOOGLE_ID_TOKEN"}
```

Complete profile (Authorization: Bearer <onboardingToken>):
```json
{"fullName":"Nguyen Van A","birthday":"2002-05-10","phone":"0987654321"}
```

Google auth trả một trong AUTHENTICATED, PROFILE_REQUIRED, ACCOUNT_LINK_REQUIRED. PROFILE_REQUIRED chỉ có onboardingToken; không có access/refresh. Complete profile không nhận userId: luôn lấy từ JWT. Token onboarding không được filter gán SecurityContext; endpoint hoàn tất hồ sơ tự xác minh loại token/chữ ký/thời hạn trong service. Link luôn cần ACCESS JWT.

## Transaction và giới hạn hiện tại

- Register/save OTP nằm trong transaction; SMTP lỗi sẽ rollback database. SMTP và database không phải distributed transaction: email có thể đã gửi nếu commit database thất bại sau đó (giữ workflow gửi mail đồng bộ hiện tại).
- Lock User khi verify/resend OTP, hoàn tất hồ sơ và link; unique indexes bảo vệ race giữa các tài khoản. Vi phạm constraint do race trả HTTP 409 theo wrapper hiện có.
- OTP sai tối đa 5 lần; record bị khóa được giữ để không vượt cooldown resend 60 giây. Resend thay hash, reset attempts; verify thành công xóa OTP.
- Giữ blacklist logout trong RAM như kiến trúc cũ: chỉ thu hồi access token được gửi, không thu hồi refresh token hoặc toàn bộ phiên; mất blacklist khi restart, không chia sẻ giữa nhiều instance. Client cần xóa cả access/refresh khi logout. Refresh không có rotation/reuse detection; muốn logout thu hồi toàn bộ phiên cần thêm persistent session/revocation, ngoài SRS này.
- Không chạy Google thật hoặc gửi Brevo thật trong test; các tích hợp này cần kiểm tra với môi trường triển khai.
- Migration PostgreSQL chưa chạy trên database thật; test persistence dùng H2 tạm.

## Kiểm tra

Lệnh: `mvn -B "-Dtest=Authentication*Tests" test`.

Kết quả: BUILD SUCCESS; 27 tests, 0 failures, 0 errors (20 service, 5 Spring Security/MockMvc, 2 persistence). Backend được compile trong cùng lệnh test.

Bộ test gồm luồng service, MockMvc/Spring Security và transaction OTP với H2. Test contextLoads cũ cần toàn bộ cấu hình/database của ứng dụng; không đưa vào bộ test auth độc lập. Không dùng database hiện tại trong các test mới.

## File sửa

- pom.xml
- src/main/resources/application.yaml
- src/main/java/com/be/entity/User.java
- src/main/java/com/be/repository/UserRepository.java
- src/main/java/com/be/mapper/UserMapper.java
- src/main/java/com/be/dto/request/RegisterRequest.java
- src/main/java/com/be/dto/request/VerifyOtpRequest.java
- src/main/java/com/be/dto/request/ResendOtpRequest.java
- src/main/java/com/be/dto/response/LoginResponse.java
- src/main/java/com/be/config/JwtService.java
- src/main/java/com/be/config/JwtAuthenticationFilter.java
- src/main/java/com/be/config/SecurityConfig.java
- src/main/java/com/be/controller/AuthController.java
- src/main/java/com/be/service/AuthService.java
- src/main/java/com/be/service/impl/AuthServiceImpl.java
- src/main/java/com/be/service/impl/EmailOtpServiceImpl.java
- src/main/java/com/be/exception/ErrorCode.java
- src/main/java/com/be/exception/GlobalExceptionHandler.java

## File mới

- src/main/java/com/be/dto/request/GoogleAuthRequest.java
- src/main/java/com/be/dto/request/CompleteProfileRequest.java
- src/main/java/com/be/dto/request/RefreshTokenRequest.java
- src/main/java/com/be/dto/response/GoogleAuthResponse.java
- src/main/java/com/be/enums/GoogleAuthStatus.java
- src/main/java/com/be/service/GoogleTokenVerifier.java
- src/main/java/com/be/service/GoogleAuthService.java
- src/main/java/com/be/service/AuthTokenService.java
- src/main/java/com/be/service/impl/GoogleAuthServiceImpl.java
- src/test/java/com/be/AuthenticationTests.java
- src/test/java/com/be/AuthenticationSecurityTests.java
- src/test/java/com/be/AuthenticationPersistenceTests.java
- database/authentication-migration.sql
- docs/authentication.postman_collection.json
- docs/AUTHENTICATION.md
