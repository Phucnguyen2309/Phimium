# Cach hoat dong cua project Phimium BE

File nay tom tat cach backend dang chay, cac tang code chinh va luong request trong project.

## 1. Tong quan

Project nay la backend Spring Boot cho Phimium.

Cong nghe chinh:

- Java 17
- Spring Boot 3.5.3
- Spring Web: tao REST API
- Spring Security: bao ve API bang JWT
- Spring Data JPA: lam viec voi database
- PostgreSQL: database chinh
- Lombok: giam code getter, setter, builder
- JJWT: tao va doc JWT token
- Cloudinary: upload anh activity
- Swagger/OpenAPI: xem va test API tren UI

Ung dung chay tu class:

```text
src/main/java/com/be/BeApplication.java
```

Config chinh nam o:

```text
src/main/resources/application.yaml
```

Mac dinh server chay port `8080`, tru khi co bien moi truong `PORT`.

## 2. Cau truc code

Project dang chia theo cac lop quen thuoc:

```text
controller  -> nhan request tu client
service     -> xu ly nghiep vu
repository  -> truy van database
entity      -> map table database
dto         -> object request/response cho API
mapper      -> chuyen entity <-> dto
config      -> cau hinh security, jwt, cloudinary, swagger
exception   -> xu ly loi chung
enums       -> cac trang thai/loai du lieu co dinh
```

Vi du luong co ban:

```text
Client goi API
-> Controller nhan request
-> Service xu ly logic
-> Repository lay/luu database
-> Mapper doi Entity sang Response DTO
-> Controller tra ApiResponse ve client
```

Tat ca response thanh cong dang dung format:

```json
{
  "success": true,
  "code": 0,
  "message": "Success",
  "data": {},
  "timestamp": "..."
}
```

## 3. Authentication va JWT

Auth nam o:

```text
AuthController
AuthService
AuthServiceImpl
JwtService
JwtAuthenticationFilter
SecurityConfig
```

### Register

Endpoint:

```http
POST /api/auth/register
```

Luong xu ly:

```text
Client gui email, password, fullname, phone, birthdate
-> AuthController.register()
-> AuthServiceImpl.register()
-> check email da ton tai chua
-> ma hoa password bang PasswordEncoder
-> tao User role USER
-> luu vao bang users
-> tra RegisterResponse
```

### Login

Endpoint:

```http
POST /api/auth/login
```

Luong xu ly:

```text
Client gui email/password
-> AuthServiceImpl tim User theo email
-> so sanh password bang PasswordEncoder
-> JwtService.generateToken(user)
-> tra token, username, role
```

JWT token co:

- subject: `userId`
- username: email
- role: role cua user
- expiration: theo `TOKEN_EXPIRE_MS`, mac dinh 1 ngay

### Logout

Endpoint:

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

Luong xu ly:

```text
Client gui token hien tai
-> AuthServiceImpl.logout()
-> check token hop le
-> JwtService blacklist token do
-> token do khong dung duoc nua cho request sau
```

Luu y: blacklist hien dang luu in-memory, nen neu restart server thi danh sach token logout se mat.

### Bao ve API

`SecurityConfig` cho phep public:

```text
/api/auth/**
/swagger-ui/**
/v3/api-docs/**
/swagger-ui.html
/auth/**
```

Con lai can JWT.

Moi request co header:

```http
Authorization: Bearer <token>
```

se di qua `JwtAuthenticationFilter`:

```text
Doc token tu header
-> JwtService.isTokenValid(token)
-> lay subject userId
-> tim User trong database
-> neu user ACTIVE thi set vao SecurityContext
-> controller co the lay user bang @AuthenticationPrincipal
```

## 4. User va Buddy

### User

Entity:

```text
User
```

Bang:

```text
users
```

User implement `UserDetails` de Spring Security doc role/quyen.

Role duoc tao thanh authority:

```text
ROLE_USER
ROLE_BUDDY
...
```

User chi duoc xem la enabled khi:

```text
status == ACTIVE
```

### Upgrade Buddy

Endpoint:

```http
PATCH /api/buddies/upgrade
Authorization: Bearer <token>
```

Luong xu ly:

```text
Client gui thong tin Buddy
-> BuddyController lay current user tu @AuthenticationPrincipal
-> BuddyServiceImpl.upgradeBuddy()
-> tim User theo userId
-> check user da la BUDDY chua
-> check da co Buddy profile chua
-> doi role User thanh BUDDY
-> tao Buddy profile
-> tra BuddyResponse
```

Buddy entity co khoa chinh:

```text
buddyId
```

va lien ket voi User qua:

```text
Buddy.user
```

## 5. Activity

Entity:

```text
Activity
```

Bang:

```text
activities
```

Activity co cac thong tin:

- title, description
- activityType
- thumbnailUrl
- startTime, endTime, registrationDeadline
- locationName, address, longitude, latitude
- participationFee
- minimumParticipants, maximumParticipants
- groupMinSize, groupMaxSize
- status
- createdBy: User tao activity
- host: Buddy host activity

### Create Activity

Endpoint:

```http
POST /api/activity/createActivity
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Request gom:

```text
request: JSON string cua ActivityRequest
image: file anh, optional
```

Luong xu ly:

```text
ActivityController doc request JSON bang ObjectMapper
-> validate ActivityRequest
-> lay currentUser tu @AuthenticationPrincipal
-> ActivityServiceImpl.createActivity()
-> tim host Buddy theo hostId
-> ActivityMapper.toEntity()
-> neu co image thi upload len Cloudinary
-> save Activity
-> tra ActivityResponse
```

### Get all Activity

Endpoint:

```http
GET /api/activity/getAll
```

Luong xu ly:

```text
ActivityController
-> ActivityServiceImpl.getAllActivities()
-> ActivityRepository.findAll()
-> ActivityMapper.toResponseList()
-> tra list ActivityResponse
```

### Get Activity by Buddy

Endpoint hien tai:

```http
GET /api/buddies/getActivityByBuddy?buddy=<buddyId>
```

Muc tieu la lay danh sach activity theo host_id trong activity.

Trong entity, `Activity.host` la object `Buddy`, nen neu query theo id thi dung field con:

```text
host.buddyId
```

Ten repository dung nen la:

```java
findByHost_BuddyId(UUID hostId)
```

## 6. Activity Group

Entity:

```text
ActivityGroup
```

Bang:

```text
activitygroup
```

ActivityGroup co:

- groupId
- group_name
- status
- maximumParticipants
- activity
- created_at

### Create Group

Endpoint:

```http
POST /api/group/createGroup
```

Luong xu ly:

```text
Client gui ActivityGroupRequest
-> ActivityGroupController.createGroup()
-> ActivityGroupServiceImpl.createActivityGroup()
-> tim Activity theo activityId
-> ActivityGroupMapper.toEntity()
-> save ActivityGroup
-> tra ActivityGroupResponse
```

### Get all Group

Endpoint:

```http
GET /api/group/getAllGroup
```

Luong xu ly:

```text
ActivityGroupController.getAllGroup()
-> ActivityGroupServiceImpl.getAllGroup()
-> ActivityGroupRepository.findAll()
-> ActivityGroupMapper.toResponseList()
-> tra list ActivityGroupResponse
```

## 7. Exception handling

Loi duoc xu ly chung o:

```text
GlobalExceptionHandler
```

Cac loi nghiep vu nem bang:

```java
throw new AppException(ErrorCode.SOMETHING);
```

Sau do handler se tra response:

```json
{
  "success": false,
  "code": 1001,
  "message": "...",
  "data": null,
  "timestamp": "..."
}
```

Cac nhom loi dang co:

- Auth/User: 1000 - 1999
- Group: 2000 - 2999
- Registration: 3000 - 3999
- Buddy: 4000+
- Activity: 5000+
- Common: 9000+

## 8. Database va config moi truong

Database la PostgreSQL.

`application.yaml` doc config tu bien moi truong:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
TOKEN_SECRET_KEY
TOKEN_EXPIRE_MS
```

JPA dang de:

```yaml
ddl-auto: update
show-sql: true
```

Nghia la Hibernate se tu update schema theo entity va in SQL ra console.

Cloudinary can:

```text
cloudinary.cloud_name
cloudinary.api_key
cloudinary.api_secret
```

## 9. Cach chay project

Neu may co Maven:

```powershell
mvn spring-boot:run
```

Compile khong chay app:

```powershell
mvn -DskipTests compile
```

Neu Maven wrapper hoat dong:

```powershell
.\mvnw.cmd spring-boot:run
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

## 10. Tom tat luong lon

```text
Dang ky / dang nhap
-> nhan JWT token
-> client gui token o Authorization header
-> JwtAuthenticationFilter xac thuc user
-> controller lay current user neu can
-> service xu ly nghiep vu
-> repository lam viec voi PostgreSQL
-> mapper doi entity sang response
-> tra ApiResponse ve client
```

