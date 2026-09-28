# Báo cáo refactor Phimium-FE

**Ngày:** 28/09/2026
**Phạm vi:** `Phimium-FE/src` + tài liệu và cấu hình ở thư mục gốc
**Bản sao lưu:** code cũ được giữ nguyên ở `FE/_backup_truoc_refactor_20260928/`. Bạn cũng có thể revert bằng git.

---

## 1. Tóm tắt

| Hạng mục | Trước | Sau |
| --- | --- | --- |
| Cách tổ chức `pages/` | Lẫn hai kiểu: file `XxxPage.jsx` nằm ngoài + folder | Mỗi trang là **1 folder** gồm `XxxPage` + `XxxView` + `useXxx` |
| Trang import chéo nhau | 5 chỗ | 0 (phần dùng chung đã chuyển lên `features/` và `components/`) |
| Mock / dữ liệu giả, badge gõ cứng | 9 chỗ | 0 |
| Hàm format bị viết lặp | ~10 bản | Gom về `utils/format.js` |
| Logic chuẩn hoá role | Lặp ở 4 file | `utils/role.js` |
| File chết (không được import) | 3 | 0 |
| Import dạng `../` hoặc thiếu đuôi file | Nhiều | 0 (chỉ còn `./` trong cùng folder) |
| Route 404 | Chưa có | Có `NotFoundPage` |
| Bug link tới route không tồn tại | Có (`ROUTES.myActivities`) | Đã sửa |

Kiểm tra sau khi sửa:
- Bundle toàn bộ `src` bằng esbuild: **OK, 91 file**, không có import hỏng và không có file thừa.
- TypeScript check (bật `noUnusedLocals`): **0 lỗi**. Bản cũ có 3 lỗi: `useMemo` import thừa, `BackButton` không được export, và `MyActivitiesPage` import sai tên.
- ⚠️ Chưa chạy được `npm run build` / `npm run lint`, vì registry npm bị chặn trong môi trường của mình. **Bạn chạy lại 2 lệnh này trên máy nhé.**

---

## 2. Cấu trúc mới

```text
src/
  app/App.jsx                      router (gom nhóm route, thêm helper withRoles)
  assets/images/                   (đổi tên từ asset/)
  components/
    common/     BackButton, Container, UserAvatar (mới), index.js
    layout/     SiteFooter          (đổi từ pages/Home/components/HomeFooter)
    activity/   SafetyTermsModal
  constants/
    app.js
    activity.js                    (mới) status label + màu status của nhóm
  context/      AuthProvider.jsx, authContext.js
  features/                        (mới) module dùng ở nhiều trang
    activity/activityMapper.js     (từ pages/Activity/ActivityMapper.js)
    myActivities/                  (từ pages/MyActivities)
      MyActivitiesPanel.jsx, useMyActivities.js, myActivitiesMapper.js,
      constants.js, components/
    myGroups/                      (từ pages/MyGroup)
      MyGroupsPanel.jsx, useMyGroups.js, myGroupsMapper.js, components/
  hooks/useDocumentTitle.js
  layouts/MainLayout.jsx
  pages/
    Activities/     ActivitiesPage, ActivitiesView, useActivities, components/ActivityCard
    ActivityDetail/ ActivityDetailPage, ActivityDetailView, useActivityDetail, activityDetailUtils, components/
    ActivityGuideline/ ActivityGuidelinePage, ActivityGuidelineView, useActivityGuideline
    Admin/          AdminPage, AdminView
    Buddy/          BuddyPage, BuddyView, useBuddy, components/StarRating
    Forbidden/      ForbiddenPage, ForbiddenView
    GroupDetail/    GroupDetailPage, GroupDetailView, useGroupDetail, groupDetailMapper,
                    components/ HostCard, NeedToKnowCard, ParticipantsCard, ParticipantSlot
    Home/           HomePage, HomeView, useHome, components/
    Login/          LoginPage, LoginView, useLogin
    NotFound/       NotFoundPage (mới)
    Register/       RegisterPage, RegisterView, useRegister
    UserDashboard/  UserDashboardPage
  routes/       paths.js, ProtectedRoute.jsx
  services/     http.js, authService.js, activityService.js, buddyService.js,
                groupService.js (mới)
  utils/        (mới) format.js, response.js, image.js, text.js, role.js
```

---

## 3. Mock data đã bỏ

| File / vị trí | Mock data | Thay bằng |
| --- | --- | --- |
| `pages/ActivityDetail/activityDetailData.js` | `fallbackDetails`: 4 hoạt động giả (gốm, cafe, rooftop, cowork) dùng ảnh Unsplash | **Xoá file**. Trang chi tiết giờ có trạng thái *đang tải* và *lỗi / không tồn tại* |
| `pages/ActivityGuideline/guidelineData.js` | `fallbackGuidelines`: hướng dẫn giả theo id; id không khớp thì lấy mặc định bài "gốm" | **Xoá file**. Chỉ hiển thị dữ liệu từ API, thêm thông báo khi chưa đăng nhập / đang tải / lỗi / trống |
| `pages/Home/homeMapper.js` | `fallbackActivities` | **Xoá file**. `useHome` dùng `mapActivitiesResponse`, và trang chủ có thêm trạng thái lỗi |
| `pages/Home/components/TestimonialsSection.jsx` | 3 review giả ("Lan N.", "Minh T.", "Hà L.") | **Xoá section.** Không nên hiển thị review bịa như review thật |
| `GroupDetail` → `HostCard` | Rating `★★★★★ (4.8)` và badge `✓ Verified`, `Vietnamese` gõ cứng | Bỏ |
| `ActivityDetail` → `ActivityHero`, `ActivityHostBookingCard` | Badge `Verified host` / `Verified` gõ cứng | Bỏ |
| `Home` → `PopularActivityCard` | Badge `Đã xác minh` cho mọi thẻ, `Xu hướng mới` | Thẻ lớn hiện `Nổi bật`, thẻ ngang hiện loại hoạt động thật |
| `features/myActivities/constants.js` | `DEFAULT_ACTIVITY.rating: 5`, dẫn tới dòng "Bạn đã đánh giá 5 sao" với mọi hoạt động | Bỏ rating giả và dòng chữ này |
| `Register/RegisterView.jsx` | Ảnh nền lấy từ Unsplash | Dùng ảnh local `assets/images/background.jpg` |

Còn giữ lại: ảnh placeholder SVG khi hoạt động không có ảnh. Đây là ảnh thay thế, không phải dữ liệu giả.

---

## 4. Thay đổi chi tiết theo nhóm

### 4.1 Routes và App
- `App.jsx`: tất cả import đều dùng `@/…`, gom route theo nhóm Auth / Public / User / Buddy / Admin / Errors, thêm helper `withRoles()` và route `*` → `NotFoundPage`.
- `paths.js`:
  - Bỏ `myGroup` (không dùng) và `myActivities` (đang bị comment).
  - Thêm `notFound`.
  - `buildGroupDetailPath` lấy từ `ROUTES.groupDetail` thay vì gõ cứng `/groups`.
  - `getDefaultRouteByRole` dùng `USER_ROLES` và `normalizeRole`.
- `ProtectedRoute.jsx`: dùng `normalizeRole`.
- **Sửa bug:** `ActivityGuidelineView` link tới `ROUTES.myActivities` là `undefined`. Giờ link tới `ROUTES.userDashboard`.
- `ActivityQuickLinks`: bỏ `?? ROUTES.home` thừa; nút "Quay lại" về trang chủ đổi thành "Xem hoạt động khác".

### 4.2 Services
- `activityService`:
  - Bỏ `getMyRegistrations`, vì trùng endpoint với `getMyActivities` và không ai dùng.
  - Chuyển các API về nhóm sang `groupService`.
- `groupService.js` (mới): `getMyGroups`, `getGroupDetail` (trước đây tên là `getGroupdetails`).
- `buddyService`: truyền query bằng `params` của axios thay vì nối chuỗi; xoá comment cũ.
- `authService`: lỗi được chuẩn hoá thành `Error` có `message`. Trước đây `throw` ra object hoặc string, nên `useLogin` đọc `err.message` luôn bị rỗng và **không hiển thị đúng thông báo lỗi từ BE**.

### 4.3 Auth và layout
- `AuthProvider`: dùng `normalizeRole`, xoá các comment `// THÊM DÒNG NÀY`.
- `MainLayout`: sắp lại import, dùng `normalizeRole` và `USER_ROLES`, kiểm tra trang Buddy bằng `startsWith(ROUTES.buddy)`.
- `BuddyPage`:
  - Bỏ đoạn đọc thẳng `localStorage.getItem('user')` và `console.log("Buddy ID xịn…")`.
  - Lấy `buddyId` từ `useAuth()`.

### 4.4 Utils và constants (mới)
- `utils/format.js`: `formatMoney`, `formatDateTime`, `formatDate`, `formatTimeRange`, `formatEnumLabel`.
- `utils/response.js`: `safeList`, `getResponseData`, `getResponseList`. Trước đây 4 mapper mỗi cái tự viết một bản.
- `utils/image.js`: `getValidImage`. Trước đây có 4 hàm riêng và nhiều chỗ viết inline.
- `utils/text.js`: `getValidText`, `getInitials`. Trước đây có 3 bản.
- `utils/role.js`: `normalizeRole`.
- `constants/activity.js`: `ACTIVITY_STATUS`, `ACTIVITY_STATUS_LABELS`, `GROUP_STATUS_STYLES`.
- Xoá `utils/cn.js` (không dùng).

### 4.5 Components dùng chung
- `components/common/BackButton.jsx`: trước đây là file chết (không export, import `useMemo` thừa). Giờ đã export và dùng ở GroupDetail và ActivityDetail. Xoá bản `BackButton` viết lại trong `GroupDetailPage`.
- `components/common/UserAvatar.jsx` (mới): gộp 3 component `Avatar` / `BuddyAvatar` bị viết lặp.
- `components/layout/SiteFooter.jsx`: đổi từ `HomeFooter`. Footer đang dùng ở 3 trang nên chuyển ra ngoài `pages/Home`.

### 4.6 Từng trang
- **Activities** (trước là `pages/Activity`): thêm `ActivitiesPage.jsx`. View nhận props thay vì tự gọi hook. Đổi tên `useActivity` → `useActivities`.
- **ActivityDetail**:
  - Thêm state `error`.
  - Khi chưa có dữ liệu thì hiện loading hoặc lỗi, thay vì render trang rỗng hay dữ liệu giả.
  - `activityDetailUtils.js` chỉ còn các hàm riêng của trang (`formatRating`, `hasValidCoordinates`).
- **ActivityGuideline**: xem mục 3.
- **GroupDetail** (tách từ `pages/MyGroup/GroupDetailPage.jsx` dài 414 dòng):
  - Tách thành `GroupDetailPage` + `GroupDetailView` và 4 component con.
  - **Sửa logic:** trước đây thành viên *đầu tiên* luôn được coi là "You". Giờ so sánh với `user.userId` đang đăng nhập.
- **Home**: bỏ mock và section testimonials; thêm trạng thái lỗi; đặt title trang.
- **Buddy**:
  - Tách `StarRating` ra `components/`.
  - Dùng format chung; status hiển thị bằng label tiếng Việt.
  - Chuyển CSS thanh cuộn từ `<style dangerouslySetInnerHTML>` sang `index.css`.
  - **Sửa bug:** khi không có `buddyId` thì skeleton loading quay mãi. Giờ hiện thông báo.
  - Thêm trạng thái lỗi.
- **UserDashboard**:
  - Import từ `features/`, không còn import chéo trang.
  - **Sửa:** sau khi join hoạt động, trang nhận `state.activeTab` và `state.message` nhưng trước đây bỏ qua. Giờ hiện thông báo "Đăng ký tham gia thành công".
- **MyActivities** (chuyển sang `features/myActivities`):
  - **Sửa bug:** code so sánh status với `'IN_PROGRESS'`, nhưng mapper chỉ trả về `ONGOING`, nên style "đang diễn ra" không bao giờ hiện. Đã sửa.
  - Nút "Xem chi tiết" giờ là link tới trang chi tiết (trước đây là nút không làm gì).
- **MyGroups** (chuyển sang `features/myGroups`):
  - `MyGroupCard` dùng `UserAvatar` và các util chung.
  - Sửa format JSX bị lệch thụt lề.
- **Login / Register / Admin / Forbidden**: mỗi trang có folder và `XxxPage.jsx` riêng, có đặt title trang.
- **NotFound** (mới): trang 404.

### 4.7 Mapper activity
- `mapActivity` giờ trả thêm `status` và `currentParticipants`. Trước đây `status` bị bỏ mất, nên:
  - `ActivityCard` luôn hiện "Đã đăng";
  - BuddyView luôn nhận `undefined`.

### 4.8 File ở thư mục gốc
- `HUONG_DAN_CAU_TRUC.md`: **viết lại** theo cấu trúc thật. Bản cũ còn ví dụ app phim và nhắc tới `features/` và `assets/` trong khi code chưa có.
- `README.md`: cập nhật phần Structure và Environment.
- `.env.example` (mới): mẫu `VITE_API_BASE_URL`. `.gitignore` thêm `!.env.example` để file này được commit.
- Chuyển 2 file log rỗng `vite-server.err.log` và `vite-server.out.log` vào thư mục backup.

Line ending giữ nguyên **CRLF** như code cũ.

---

## 5. Những gì KHÔNG thay đổi
- Giao diện và Tailwind class, trừ các badge hoặc rating giả đã bỏ ở mục 3.
- Endpoint API và key trong localStorage (`token`, `user`), nên không làm người dùng bị đăng xuất.
- `package.json`, `vite.config.js`, `eslint.config.js`, `vercel.json`.
- Các nút chưa có chức năng vẫn để nguyên, vì cần BE hoặc thiết kế: *Open Group Chat*, *Invite Friend*, *View Profile*, *Viết đánh giá*, *Đặt lại*, *Nhắn tin*, *Tạo sự kiện mới*. Hàm `handleCreateActivity` có ghi chú `TODO`.

---

## 6. Việc bạn cần làm / gợi ý tiếp

1. **Chạy kiểm tra trên máy**:
   ```bash
   npm run build
   npm run lint
   npm run dev
   ```
   Sau đó click thử: Trang chủ → Hoạt động → Chi tiết → Tham gia → Dashboard (tab Nhóm) → Chi tiết nhóm; đăng nhập Buddy và Admin.
2. **Lint:** `eslint-plugin-react-hooks` v7 có rule `set-state-in-effect`. Code cũ đã gọi `setLoading(true)` trong `useEffect` ở mọi hook, nên có thể lint báo lỗi ở đây từ trước. Cách xử lý lâu dài là dùng TanStack Query hoặc một hook `useFetch` chung.
3. **Tự đăng xuất khi 401:** thêm response interceptor trong `http.js`.
4. **Trang Admin** hiện mới chỉ có tiêu đề.
5. Nên đổi key localStorage thành `phimium_token` / `phimium_user` khi tiện. Việc này sẽ đăng xuất người dùng một lần.
6. Nên thêm Prettier để thống nhất format. `BuddyView.jsx` vẫn còn style khác các file còn lại (dấu `;`, class dài một dòng).
