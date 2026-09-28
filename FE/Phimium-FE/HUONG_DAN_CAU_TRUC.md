# Quy ước code FE – Phimium

> Tài liệu này là **chuẩn bắt buộc** cho mọi code trong `Phimium-FE`, dù người viết là người hay AI (Codex, Claude…).
> Khi code mới mâu thuẫn với tài liệu này thì **sửa code theo tài liệu**. Muốn đổi quy ước thì sửa tài liệu này trước.

---

## 0. Tóm tắt 13 luật quan trọng nhất

1. Mỗi route là **một folder** trong `src/pages/`, gồm `XxxPage.jsx` + `XxxView.jsx` + `useXxx.js`.
2. **Không import chéo giữa các trang.** Code dùng ở ≥ 2 trang phải chuyển lên `components/`, `features/` hoặc `utils/`.
3. **Không dùng mock data / dữ liệu giả.** Dữ liệu chỉ lấy từ API. Nếu API rỗng hoặc lỗi thì hiển thị trạng thái tương ứng.
4. **Không gọi `axios` / `http` trong component hay hook trang.** Mọi request đi qua `src/services/xxxService.js`.
5. **Không gõ cứng đường dẫn.** Dùng `ROUTES.xxx` và `buildXxxPath()` trong `src/routes/paths.js`.
6. **Không tự viết lại hàm format / helper.** Dùng những hàm đã có trong `src/utils/` (xem mục 6).
7. Import ngoài folder hiện tại luôn dùng alias `@/`, **có đuôi file** (`.js` / `.jsx`). Không dùng `../`.
8. Component dùng **named export**. Chỉ `XxxPage.jsx`, `App.jsx`, `http.js` và các service object dùng `export default`.
9. Mỗi màn hình có dữ liệu từ API phải có đủ 4 trạng thái: **loading / error / empty / có dữ liệu**.
10. Không để `console.log` khi commit. Chỉ dùng `console.error` / `console.warn` trong `catch`.
11. Không thêm thư viện mới vào `package.json` nếu chưa được đồng ý.
12. **Không gõ cứng chữ hiển thị.** Mọi chữ trên UI dùng `t('key')` và phải có đủ bản **tiếng Việt + tiếng Anh** trong `src/locales/` (xem mục 16).
13. File giữ line ending **CRLF**, thụt lề 2 space, không dấu `;`, dùng nháy đơn `'`.

---

## 1. Công nghệ

| Mục | Dùng |
| --- | --- |
| UI | React 19, JavaScript (`.js` / `.jsx`, **không** TypeScript) |
| Build | Vite |
| Style | Tailwind CSS 4 (class trực tiếp trong JSX, **không** viết file CSS riêng cho component) |
| Router | React Router 7 (`BrowserRouter` + `Routes` trong `src/app/App.jsx`) |
| HTTP | Axios qua instance `src/services/http.js` |
| State | `useState` / `useMemo` + React Context (`AuthProvider`). **Chưa** dùng Redux / Zustand / React Query. |
| Deploy | Vercel (`vercel.json` rewrite mọi route về `index.html`) |

Env: `VITE_API_BASE_URL` (xem `.env.example`). Mặc định là `http://localhost:8080/api`.

---

## 2. Cây thư mục

```text
src/
  main.jsx                  entry: render <AuthProvider><App/></AuthProvider>
  index.css                 chỉ @import tailwind + style global
  app/
    App.jsx                 khai báo tất cả <Route>
  assets/images/            ảnh import trong code
  components/               UI dùng chung, KHÔNG gọi API
    common/                 AuthAlert, BackButton, Container, FormField, PasswordField,
                            LanguageSwitcher, UserAvatar  (import từ '@/components/common')
    layout/                 SiteHeader, BrandLogo, SiteFooter
    activity/               SafetyTermsModal
  constants/
    app.js                  APP_NAME, STORAGE_KEYS, USER_ROLES
    activity.js             ACTIVITY_STATUS, ACTIVITY_STATUS_LABELS, GROUP_STATUS_STYLES
  context/
    authContext.js          AuthContext + hook useAuth()
    languageContext.js      LanguageContext + hook useLanguage()
    LanguageProvider.jsx    ngôn ngữ hiện tại (vi / en), lưu lựa chọn
    AuthProvider.jsx        login / logout / user
  features/                 module dùng ở NHIỀU trang (có hook / mapper / component riêng)
    activity/activityMapper.js
    myActivities/           MyActivitiesPanel, useMyActivities, myActivitiesMapper, constants, components/
    myGroups/               MyGroupsPanel, useMyGroups, myGroupsMapper, components/
  hooks/
    useDocumentTitle.js
    useClickOutside.js      đóng dropdown / menu khi click ra ngoài
  layouts/
    MainLayout.jsx          header + khung trang
    AuthLayout.jsx          khung trang Đăng nhập / Đăng ký (panel thương hiệu + form)
  pages/                    1 folder = 1 route
    Activities/  ActivityDetail/  ActivityGuideline/  Admin/  Buddy/
    Forbidden/   GroupDetail/     Home/  Login/  NotFound/  Register/  UserDashboard/
  routes/
    paths.js                ROUTES, buildXxxPath(), getDefaultRouteByRole()
    ProtectedRoute.jsx      chặn theo đăng nhập + role
  services/
    http.js                 axios instance (tự gắn Bearer token)
    authService.js  activityService.js  groupService.js  buddyService.js
  utils/                    hàm thuần JS, KHÔNG import React
    format.js  response.js  image.js  text.js  role.js  i18n.js
  locales/                  từ điển đa ngôn ngữ
    vi.js                   tiếng Việt (mặc định)
    en.js                   tiếng Anh – cùng bộ key với vi.js
```

**Không tạo thêm folder cấp 1 trong `src/`** (VD `helpers/`, `api/`, `store/`, `mocks/`, `types/`) nếu chưa cập nhật tài liệu này.

---

## 3. Đặt code ở đâu? (bảng quyết định)

| Code bạn đang viết | Đặt ở |
| --- | --- |
| Component chỉ 1 trang dùng | `pages/<Trang>/components/` |
| Mapper / helper chỉ 1 trang dùng | `pages/<Trang>/xxxMapper.js` hoặc `xxxUtils.js` |
| Component UI thuần, ≥ 2 nơi dùng, không gọi API | `components/common/` (nhớ export trong `index.js`) |
| Header, footer, sidebar dùng chung | `components/layout/` hoặc `layouts/` |
| Khối có hook + API + mapper, ≥ 2 trang dùng | `features/<tenFeature>/` |
| Mapper dữ liệu API dùng ở ≥ 2 trang | `features/<tenFeature>/xxxMapper.js` |
| Hàm format ngày / tiền / text, xử lý response | `utils/` |
| Hook dùng chung, không gắn với nghiệp vụ | `hooks/` |
| Gọi API | `services/` |
| Hằng số: role, status, label, storage key, màu theo status | `constants/` |

Khi một thứ trước đây chỉ 1 trang dùng mà nay trang thứ 2 cũng cần, hãy **di chuyển** nó lên chỗ chung và sửa import ở cả hai nơi. **Không** import sang folder của trang kia.

---

## 4. Cấu trúc một trang (`pages/`)

```text
pages/GroupDetail/
  GroupDetailPage.jsx      component route – App.jsx import file này
  GroupDetailView.jsx      chỉ giao diện, nhận mọi thứ qua props
  useGroupDetail.js        state, gọi service, xử lý sự kiện
  groupDetailMapper.js     (tuỳ chọn) map dữ liệu API cho riêng trang này
  components/              component con chỉ dùng trong trang này
    HostCard.jsx
    ParticipantsCard.jsx
```

### Trách nhiệm từng file

| File | Được làm | Không được làm |
| --- | --- | --- |
| `XxxPage.jsx` | `useDocumentTitle`, gọi hook, lấy `useAuth()`, truyền props cho View | Viết JSX giao diện, gọi API |
| `XxxView.jsx` | Render UI theo props, hiển thị loading / error / empty | Gọi API, `useEffect` fetch, đọc `localStorage` |
| `useXxx.js` | `useState`, `useEffect`, gọi service, map dữ liệu, trả object cho View | Trả JSX |
| `components/*.jsx` | UI nhỏ, có thể có state UI (mở/đóng…) | Gọi API |

### Mẫu chuẩn

```jsx
// pages/Example/ExamplePage.jsx
import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { ExampleView } from './ExampleView.jsx'
import { useExample } from './useExample.js'

const ExamplePage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('example.pageTitle'))

  const example = useExample()

  return <ExampleView {...example} />
}

export default ExamplePage
```

```js
// pages/Example/useExample.js
import { useEffect, useState } from 'react'

import { mapActivitiesResponse } from '@/features/activity/activityMapper.js'
import activityService from '@/services/activityService.js'

export function useExample() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchItems = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await activityService.getAllActivities()

        if (isMounted) {
          setItems(mapActivitiesResponse(response))
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err)

        if (isMounted) {
          setError(err)
          setItems([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchItems()

    return () => {
      isMounted = false
    }
  }, [])

  return { items, loading, error }
}
```

```jsx
// pages/Example/ExampleView.jsx
import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

export function ExampleView({ items = [], loading = false, error = null }) {
  const { t } = useLanguage()

  return (
    <Container className="py-10">
      {loading ? (
        <p className="text-sm text-slate-500">{t('example.loading')}</p>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">
          {t('example.loadError')}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">{t('example.empty')}</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      )}
    </Container>
  )
}
```

Luôn có flag `isMounted` (hoặc `ignore`) trong `useEffect` fetch để tránh `setState` sau khi component đã unmount.

---

## 5. Routes

### Thêm route mới

1. Thêm key vào `ROUTES` trong `src/routes/paths.js`. Route có tham số thì thêm hàm `buildXxxPath()`.
2. Thêm `<Route>` vào `src/app/App.jsx`, đúng nhóm (Auth / Public / User / Buddy / Admin / Errors), **đặt trước** route `ROUTES.notFound`.
3. Route cần đăng nhập thì dùng `withRoles([USER_ROLES.xxx], <XxxPage />)`. Route public thì dùng `withMainLayout(<XxxPage />)`.

```js
// paths.js
export const ROUTES = {
  // ...
  groupDetail: '/groups/:groupId',
}

export const buildGroupDetailPath = (groupId) =>
  ROUTES.groupDetail.replace(':groupId', groupId)
```

```jsx
// Dùng
<Link to={buildGroupDetailPath(group.groupId)}>...</Link>
navigate(ROUTES.userDashboard, { state: { activeTab: 'GROUPS' } })
```

**Không bao giờ** viết `to="/groups/123"` hay `` `/activities/${id}` `` trực tiếp trong component.

### Role

- Role hợp lệ: `USER_ROLES.user` (`'USER'`), `USER_ROLES.buddy` (`'BUDDY'`), `USER_ROLES.admin` (`'ADMIN'`).
- Khi so sánh role, luôn chuẩn hoá bằng `normalizeRole()` từ `@/utils/role.js`. BE có thể trả `ROLE_USER`.

---

## 6. Utils có sẵn – bắt buộc dùng, không viết lại

| Hàm | File | Ví dụ |
| --- | --- | --- |
| `formatMoney(value)` | `utils/format.js` | `450000` → `"450.000 VND"`, `0` → `"Miễn phí"` |
| `formatDateTime(value, fallback?)` | `utils/format.js` | ngày + giờ |
| `formatDate(value, fallback?)` | `utils/format.js` | `"10/07/2026"` |
| `formatTimeRange(start, end, { fallback, weekday, separator })` | `utils/format.js` | `"10 thg 7, 2026, 09:00 - 11:00"` |
| `formatEnumLabel(value, fallback?)` | `utils/format.js` | `"BOARD_GAME"` → `"Board Game"` |
| `safeList(value)` | `utils/response.js` | luôn trả về mảng |
| `getResponseList(response)` | `utils/response.js` | lấy mảng từ `data` / `data.data` / `data.content` |
| `getResponseData(response)` | `utils/response.js` | lấy object từ `data` / `data.data` |
| `getValidImage(url)` | `utils/image.js` | trả `''` nếu URL rỗng hoặc là `"string"` (giá trị mẫu của Swagger) |
| `getValidText(value, fallback?)` | `utils/text.js` | bỏ `''`, `"string"`, `"."`, `"-"` |
| `getInitials(name, fallback?)` | `utils/text.js` | `"Nguyễn Văn An"` → `"NA"` |
| `normalizeRole(role)` | `utils/role.js` | `"ROLE_admin"` → `"ADMIN"` |
| `t(key, params?)` | `utils/i18n.js` | Dịch cho code **không phải React** (mapper, utils, service) |
| `getLocale()` | `utils/i18n.js` | `'vi-VN'` / `'en-US'` cho `Intl` / `toLocaleString` |

Cho activity thì dùng thêm `@/features/activity/activityMapper.js`: `mapActivity`, `mapActivitiesResponse`, `formatActivityType`, `formatStatus`, `formatPrice`, `getRemainingSlots`.

Cần helper mới dùng chung thì **thêm vào file utils phù hợp**, không tạo bản sao trong component.

---

## 7. Services và API

- Một domain là một file: `authService`, `activityService`, `groupService`, `buddyService`. Domain mới thì tạo `xxxService.js`.
- Mỗi service là **một object, `export default`**. Mỗi method trả về **Promise của axios** (chưa bóc `.data`), trừ `authService` đã bóc sẵn `.data` và chuẩn hoá lỗi.
- Luôn dùng instance `http` từ `@/services/http.js`. Instance này tự gắn `Authorization: Bearer <token>`.
- Query string truyền qua `params`, không nối chuỗi.

```js
// services/exampleService.js
import http from '@/services/http.js'

const exampleService = {
  getList: (params) => http.get('/v1/examples', { params }),

  getById: (id) => http.get(`/v1/examples/${id}`),

  create: (payload) => http.post('/v1/examples', payload),
}

export default exampleService
```

- Bóc dữ liệu response trong hook hoặc mapper bằng `getResponseList()` / `getResponseData()`. **Không** viết `response.data.data` rải rác.
- Lỗi 403 đã được `ProtectedRoute` xử lý. Trong `catch` có thể bỏ qua log khi `err?.response?.status === 403`.

---

## 8. Mapper

- Mapper chuyển dữ liệu thô từ API thành object mà UI dùng. Mọi giá trị đều có fallback an toàn.
- Tên hàm: `mapXxx(item)` cho 1 phần tử, `mapXxxResponse(response)` cho cả response.
- Fallback **chỉ** là giá trị trung tính (`''`, `0`, `null`, `[]`, `t('common.comingSoon')`…). **Không** là dữ liệu bịa (tên người, rating, ảnh Unsplash, mô tả mẫu…).

```js
export const mapGroup = (group) => ({
  groupId: group?.groupId ?? '',
  groupName: group?.groupName ?? t('group.untitled'),
  thumbnailUrl: getValidImage(group?.thumbnailUrl),
  participants: safeList(group?.participants).map(mapParticipant),
})

export const mapGroupsResponse = (response) =>
  getResponseList(response).map(mapGroup)
```

---

## 9. Không mock data – chi tiết

**Cấm:**
- File `fallbackXxx`, `mockXxx`, `sampleXxx`, `dummyXxx`, hoặc dữ liệu mẫu gõ cứng để hiển thị thay cho API.
- Rating, số sao, số lượt, review / testimonial, badge `Verified`, `Đã xác minh`, `Hot`… gõ cứng khi BE không trả về.
- Ảnh từ Unsplash hay các URL bên ngoài. Ảnh tĩnh để trong `src/assets/images/`.
- Coi phần tử đầu mảng là user hiện tại. Phải so sánh với `useAuth().user.userId`.

**Được phép:**
- Nội dung marketing tĩnh của trang chủ (các bước "Cách hoạt động", lý do "Vì sao chọn Phimium").
- Placeholder hình (SVG, gradient, chữ cái đầu) khi không có ảnh.
- Text fallback trung tính như "Sắp cập nhật", "Chưa có hoạt động nào".

Nếu BE chưa có API cho một tính năng: vẫn làm UI, nhưng hiện trạng thái trống và để `// TODO: chờ API <tên endpoint>`. Nút chưa có chức năng thì để handler rỗng kèm `// TODO`.

---

## 10. Auth

- Lấy user bằng `const { user, isAuthenticated, login, logout } = useAuth()` từ `@/context/authContext.js`.
- Object `user` gồm: `username`, `role`, `userId`, `buddyId`.
- **Không đọc / ghi `localStorage` trực tiếp** trong component, hook hay trang. Chỉ `AuthProvider.jsx`, `LanguageProvider.jsx` và `http.js` được đụng tới storage, và luôn qua `STORAGE_KEYS`.
- Sau khi login, điều hướng bằng `getDefaultRouteByRole(role)`.

---

## 11. Component và UI

### Viết component

```jsx
export function ActivityCard({ activity, viewMode = 'GRID' }) {
  // ...
}
```

- Dùng `function` + **named export**. Props destructure ngay ở tham số, có giá trị mặc định cho mảng / boolean.
- Tên file là PascalCase, trùng tên component.
- Một file có thể chứa component con nhỏ, **không export**, chỉ dùng trong file đó.
- **File dài quá ~250 dòng** thì tách component con ra `components/`.
- List phải có `key` ổn định (`item.id`). Chỉ dùng `index` khi thật sự không có id.
- `<img>` phải có `alt`. Ảnh từ API đi qua `getValidImage()`. Nên có `onError` để ẩn ảnh lỗi (xem `UserAvatar`).
- Nút không submit form phải có `type="button"`.

### Component dùng chung đã có – dùng lại

| Component | Import | Dùng khi |
| --- | --- | --- |
| `Container` | `@/components/common` | Bọc nội dung, giới hạn chiều rộng (`max-w-6xl`) |
| `BackButton` | `@/components/common` | Nút "Quay lại" (`navigate(-1)`) |
| `LanguageSwitcher` | `@/components/common` | Nút đổi VI / EN (đã có trên header, Login, Register) |
| `UserAvatar` | `@/components/common` | Avatar tròn: chữ cái đầu + ảnh (đổi màu qua prop `colorClassName`) |
| `FormField` | `@/components/common` | Ô nhập có label + icon (`user`, `mail`, `lock`, `phone`, `calendar`), props còn lại truyền xuống `<input>` |
| `PasswordField` | `@/components/common` | Ô mật khẩu có nút hiện / ẩn |
| `AuthAlert` | `@/components/common` | Hộp thông báo lỗi / thành công trong form (`tone="error" \| "success"`) |
| `AuthLayout` | `@/layouts/AuthLayout.jsx` | Khung trang Đăng nhập / Đăng ký |
| `SiteHeader` | `@/components/layout/SiteHeader.jsx` | Header chung (đã gắn sẵn trong `MainLayout`): logo, 3 mục menu, VI/EN, tài khoản |
| `BrandLogo` | `@/components/layout/BrandLogo.jsx` | Logo Phimium (icon P + tên + tagline) |
| `SiteFooter` | `@/components/layout/SiteFooter.jsx` | Footer cuối trang |
| `SafetyTermsModal` | `@/components/activity/SafetyTermsModal.jsx` | Xác nhận điều khoản trước khi join |

### Style (Tailwind)

- **Màu chính: `emerald`** (`emerald-600` cho nút chính, `emerald-700` cho text / hover, `emerald-50` / `emerald-100` cho nền nhạt).
- Màu phụ: `slate` cho text và viền, `red` cho lỗi, `orange` cho điểm nhấn, `blue` dùng ở trang chi tiết hoạt động.
- **Ngoại lệ: header chung (`SiteHeader`, `BrandLogo`), trang chủ (`pages/Home`) và trang Đăng nhập / Đăng ký (`AuthLayout`)** dùng tông **navy + vàng**: nền đậm `blue-950` / `blue-900`, nút chính `bg-yellow-400 text-blue-950`, tiêu đề `text-blue-950`, nhãn nhỏ `text-blue-700`. Chỉ dùng tông này ở header, `pages/Home` và `AuthLayout`, không mang sang trang khác.
- Bo góc: card `rounded-2xl` / `rounded-3xl`, nút `rounded-xl` / `rounded-full`.
- Trạng thái lỗi: `rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600`.
- Trạng thái rỗng: khung `border-dashed border-emerald-200 bg-emerald-50/50` + tiêu đề + mô tả ngắn.
- Không dùng `style={{}}` inline, trừ giá trị động (VD `backgroundImage` từ biến). Không dùng `dangerouslySetInnerHTML`.
- Responsive theo mobile-first: `sm:` / `md:` / `lg:` / `xl:`.

---

## 12. Import

Thứ tự, mỗi nhóm cách nhau 1 dòng trống:

```js
// 1. Thư viện
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// 2. Alias @/ (sắp theo alphabet đường dẫn)
import { Container } from '@/components/common'
import { ROUTES } from '@/routes/paths.js'
import activityService from '@/services/activityService.js'

// 3. File cùng folder
import { ActivityCard } from './components/ActivityCard.jsx'
```

- `./` chỉ dùng cho file **trong cùng folder trang / feature**. Không bao giờ dùng `../`.
- Luôn ghi đuôi `.js` / `.jsx`. Ngoại lệ duy nhất: `'@/components/common'` (import qua `index.js`).

---

## 13. Đặt tên

| Loại | Quy ước | Ví dụ |
| --- | --- | --- |
| Folder trang | PascalCase | `pages/GroupDetail/` |
| Folder feature | camelCase | `features/myGroups/` |
| Page | `XxxPage.jsx`, `export default` | `GroupDetailPage.jsx` |
| View | `XxxView.jsx`, named export | `GroupDetailView.jsx` |
| Panel trong feature | `XxxPanel.jsx`, named export | `MyGroupsPanel.jsx` |
| Component | `PascalCase.jsx`, named export | `MyGroupCard.jsx` |
| Hook | `useXxx.js`, named export | `useGroupDetail.js` |
| Service | `xxxService.js`, `export default` object | `groupService.js` |
| Mapper | `xxxMapper.js` | `groupDetailMapper.js` |
| Utils / constants | `camelCase.js` | `format.js`, `activity.js` |
| Hằng số | `UPPER_SNAKE_CASE` | `ACTIVITY_STATUS_LABELS` |
| Handler | `handleXxx`, prop callback `onXxx` | `handleJoinClick`, `onClose` |
| Boolean | `isXxx`, `hasXxx`, `canXxx` | `isCompleted`, `hasBuddyId` |

**Tên export phải trùng tên file** (`useMyGroups.js` → `export function useMyGroups`).

---

## 14. Quy trình thêm một tính năng / trang

1. Xác định API cần gọi. Thêm method vào service tương ứng, hoặc tạo `xxxService.js` mới.
2. Viết mapper nếu dữ liệu cần chuẩn hoá. Chỉ 1 trang dùng thì để trong trang, nhiều trang dùng thì để trong `features/`.
3. Tạo `pages/Xxx/` gồm `XxxPage.jsx`, `XxxView.jsx`, `useXxx.js`.
4. Thêm mọi chuỗi hiển thị vào `src/locales/vi.js` **và** `src/locales/en.js` (cùng key, namespace theo tên trang).
5. Thêm path vào `ROUTES` và khai báo `<Route>` trong `App.jsx`.
6. Nếu cần link từ header hoặc menu thì sửa `layouts/MainLayout.jsx`.
7. Chạy checklist ở mục 15.

---

## 15. Checklist trước khi xong việc

- [ ] `npm run build` chạy thành công.
- [ ] `npm run lint` không có lỗi mới.
- [ ] Không có import `../`, không thiếu đuôi file, không có import thừa.
- [ ] Không có mock data, không có URL ảnh bên ngoài, không có rating / badge gõ cứng.
- [ ] Không có `console.log`, không đọc `localStorage` ngoài `AuthProvider`, `LanguageProvider` và `http`.
- [ ] Không còn chữ hiển thị gõ cứng; `node scripts/check-i18n.mjs` báo ✅ (vi.js và en.js đủ key).
- [ ] Mọi màn hình gọi API có đủ loading / error / empty.
- [ ] Đường dẫn dùng `ROUTES` / `buildXxxPath`.
- [ ] Không có file trong `pages/A` import từ `pages/B`.
- [ ] Không sửa `package.json`, `vite.config.js`, `eslint.config.js` nếu task không yêu cầu.
- [ ] Nếu thêm folder, utils hay quy ước mới thì cập nhật tài liệu này.

---

## 16. Đa ngôn ngữ (i18n): tiếng Việt + tiếng Anh

App hỗ trợ **2 ngôn ngữ: `vi` (mặc định) và `en`**. Người dùng đổi bằng `LanguageSwitcher` (VI / EN). Lựa chọn được lưu trong `localStorage` (`STORAGE_KEYS.language`).

### Các file

| File | Vai trò |
| --- | --- |
| `src/locales/vi.js`, `src/locales/en.js` | Từ điển. **Hai file phải có đúng cùng bộ key.** |
| `src/utils/i18n.js` | `t()`, `translate()`, `getLocale()`, `getCurrentLanguage()` – JS thuần |
| `src/context/LanguageProvider.jsx` | Giữ ngôn ngữ hiện tại, bọc toàn app trong `main.jsx` |
| `src/context/languageContext.js` | Hook `useLanguage()` → `{ language, setLanguage, t }` |
| `src/components/common/LanguageSwitcher.jsx` | Nút VI / EN |
| `scripts/check-i18n.mjs` | Kiểm tra thiếu key: `node scripts/check-i18n.mjs` |

### Cách dùng

```jsx
// Trong component / hook React: dùng hook
import { useLanguage } from '@/context/languageContext.js'

export function ExampleCard({ count }) {
  const { t } = useLanguage()

  return (
    <div>
      <h2>{t('example.title')}</h2>
      <p>{t('example.itemCount', { count })}</p>
    </div>
  )
}
```

```js
// Trong mapper / utils / service (không phải React): import t
import { t } from '@/utils/i18n.js'

export const mapExample = (item) => ({
  title: item?.title ?? t('example.untitled'),
})
```

```js
// src/locales/vi.js                      // src/locales/en.js
example: {                                 example: {
  title: 'Ví dụ',                            title: 'Example',
  itemCount: '{count} mục',                  itemCount: '{count} items',
  untitled: 'Chưa đặt tên',                  untitled: 'Untitled',
},                                         },
```

### Quy tắc

- **Mọi chữ người dùng nhìn thấy** (text, `placeholder`, `alt`, `aria-label`, `title`, thông báo lỗi, `useDocumentTitle`) đều qua `t()`. Không gõ cứng tiếng Việt hay tiếng Anh trong JSX.
- Thêm key thì thêm **cùng lúc vào `vi.js` và `en.js`**, cùng vị trí. Chạy `node scripts/check-i18n.mjs` để kiểm tra.
- Key đặt theo dạng `namespace.nhom.ten`, namespace là tên trang hoặc feature: `home.hero.title`, `groupDetail.loading`, `common.cancel`. Chuỗi dùng ở nhiều nơi thì để trong `common.*`.
- Tham số dùng `{ten}`: `t('activities.ledBy', { name })` với `'Dẫn bởi {name}'`. **Không** nối chuỗi kiểu `t('a') + name`.
- Mảng cấu hình (tabs, steps, menu…) lưu `labelKey` hoặc `id`, rồi gọi `t()` khi render. Không lưu chuỗi đã dịch vào hằng số cấp module.
- Hàm helper nằm **ngoài component** trong file `.jsx` không có `t` của hook: truyền `t` hoặc chuỗi đã dịch vào qua tham số (xem `getGroupSizeText(activity, t)`).
- Ngày, giờ, tiền: luôn dùng `utils/format.js`. Các hàm này tự theo ngôn ngữ hiện tại (`getLocale()`). Không viết cứng `'vi-VN'`.
- Thông báo truyền qua `navigate(..., { state })` thì truyền **key** (`messageKey: 'dashboard.joinSuccess'`), không truyền chuỗi đã dịch.
- Nội dung đến từ API (tên hoạt động, mô tả…) giữ nguyên, **không** dịch.
- Khi đổi ngôn ngữ, `LanguageProvider` mount lại toàn app (`key={language}`) để dữ liệu đã map được tính lại. Không cần tự xử lý trong từng trang.
- Thêm ngôn ngữ thứ 3: thêm vào `LANGUAGES` (`constants/app.js`), `DICTIONARIES` / `LOCALES` (`utils/i18n.js`), tạo `locales/<lang>.js` và thêm nút trong `LanguageSwitcher`.

---

## 17. Chạy project

```bash
cp .env.example .env     # lần đầu
npm install
npm run dev              # http://localhost:5173
npm run build
npm run lint
node scripts/check-i18n.mjs   # kiểm tra từ điển vi / en
```
