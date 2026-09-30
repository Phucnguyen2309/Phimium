# Hướng dẫn thực hành cấu trúc Frontend Phimium

Tài liệu dành cho người mới vào project hoặc cần biết chính xác phải sửa file nào khi làm một tính năng. Đọc cùng `HUONG_DAN_CAU_TRUC.md`: file đó là chuẩn bắt buộc; file này giải thích cách áp dụng, không thay thế hoặc tạo ngoại lệ cho chuẩn.

Các ví dụ bên dưới là hướng dẫn, chưa được thêm vào ứng dụng. Ví dụ `ActivityCatalog` dùng service và mapper đã có, không tạo dữ liệu giả hoặc giả định endpoint mới.

## 1. Hiểu luồng ứng dụng trước khi sửa

Project dùng React 19, Vite, Tailwind CSS 4, React Router 7 và Axios. Code ứng dụng là JavaScript, không TypeScript.

```text
main.jsx
  → các Provider: đăng nhập và ngôn ngữ
  → app/App.jsx: chọn trang theo URL
  → layout và ProtectedRoute nếu cần
  → XxxPage.jsx: nối hook với giao diện
  → useXxx.js: giữ state, gọi service, xử lý thao tác
  → services/xxxService.js → services/http.js → Backend
  → mapper/utils: chuẩn hóa response
  → XxxView.jsx → component con: hiển thị dữ liệu
```

Khi người dùng nhấn một nút, View gọi callback được truyền từ hook. Hook thực hiện nghiệp vụ rồi cập nhật state. React render lại View với props mới.

Ví dụ: mở danh sách hoạt động → hook gọi `activityService.getAllActivities()` → mapper chuyển response thành mảng hoạt động → View hiển thị loading, lỗi, rỗng hoặc danh sách.

Không đưa toàn bộ chuỗi công việc này vào một component. Việc chia lớp giúp sửa API mà ít ảnh hưởng giao diện, và sửa giao diện mà không phải chạm logic request.

## 2. Bản đồ thư mục: tìm đúng chỗ để làm việc

| Vị trí | Trách nhiệm | Ví dụ công việc |
| --- | --- | --- |
| `src/main.jsx` | Khởi tạo ứng dụng và Provider | Kiểm tra ứng dụng đã được bọc context |
| `src/app/App.jsx` | Khai báo route và layout tương ứng | Gắn một trang mới vào router |
| `src/routes/` | URL, hàm dựng URL, chặn truy cập theo role | Thêm đường dẫn trang chi tiết |
| `src/pages/` | Trang tương ứng với route | Danh sách, chi tiết, đăng nhập |
| `src/components/common/` | UI dùng chung, không gọi API | Input, avatar, nút quay lại |
| `src/components/layout/` | Header, footer, logo | Sửa menu ở `SiteHeader.jsx` |
| `src/components/activity/` | UI hoạt động dùng chung | Modal điều khoản an toàn |
| `src/features/` | Khối nghiệp vụ dùng ở nhiều trang | Danh sách hoạt động đã tham gia |
| `src/layouts/` | Khung bao ngoài trang | MainLayout, AuthLayout |
| `src/services/` | Gửi HTTP request | Gọi API hoạt động, nhóm, đăng nhập |
| `src/context/` | State toàn ứng dụng | User hiện tại và ngôn ngữ |
| `src/hooks/` | Hook chung không gắn nghiệp vụ | Tiêu đề tab, click bên ngoài |
| `src/utils/` | Hàm JavaScript thuần | Format tiền, xử lý response |
| `src/constants/` | Hằng số nghiệp vụ | Role, status, storage key |
| `src/locales/` | Nội dung UI VI/EN | Thêm label và thông báo lỗi |
| `src/assets/images/` | Ảnh tĩnh được import | Logo, ảnh nền |
| `src/index.css` | Tailwind và style toàn cục | Không dùng để gom CSS riêng từng component |

Không tự tạo thêm thư mục cấp một như `api/`, `helpers/`, `store/` hoặc `mocks/`. Nếu thật sự cần thay đổi cấu trúc, phải cập nhật chuẩn trước.

## 3. Chọn pages, components hay features?

Hãy trả lời lần lượt:

1. Đây là một màn hình có URL riêng? Đặt trong `pages/<TenTrang>/`.
2. Đây là UI chỉ trang đó dùng? Đặt trong `pages/<TenTrang>/components/`.
3. Đây là UI dùng ở nhiều trang, không gọi API? Đặt trong `components/` phù hợp.
4. Đây là cả một khối nghiệp vụ dùng ở nhiều trang, có hook/API/mapper? Đặt trong `features/<tenFeature>/`.
5. Đây là hàm thuần xử lý dữ liệu dùng chung? Đặt trong `utils/` hoặc mapper thuộc feature.
6. Đây là request tới backend? Đặt trong service của domain tương ứng.

Ví dụ: một card hoạt động không tự tải dữ liệu là UI. Một panel tự tải danh sách hoạt động đã tham gia, lọc theo tab và hiển thị card là feature.

Khi trang B cần component của trang A, di chuyển component sang chỗ dùng chung rồi sửa import cả hai trang. Không import từ `pages/A` sang `pages/B` và không copy thành hai bản.

## 4. Cấu trúc bắt buộc của một trang

```text
src/pages/ActivityCatalog/
  ActivityCatalogPage.jsx
  ActivityCatalogView.jsx
  useActivityCatalog.js
  components/                  # chỉ tạo khi cần
  activityCatalogMapper.js      # chỉ tạo khi mapper hiện có chưa đáp ứng
```

| File | Nên chứa | Không chứa |
| --- | --- | --- |
| Page | Tiêu đề tab, gọi hook, nối props với View | UI dài hoặc request |
| View | JSX và các trạng thái hiển thị | Fetch API, đọc storage |
| Hook | State, effect, gọi service, mapper, handler | JSX |
| Component con | Một phần UI có trách nhiệm rõ ràng | Request API |
| Mapper | Đổi dữ liệu backend thành model cho UI | React state, request, dữ liệu bịa |

Theo chuẩn hiện tại, mỗi route có đủ Page/View/hook, kể cả khi trang đơn giản. Nếu muốn miễn hook cho trang tĩnh, cần thống nhất và sửa chuẩn trước; đừng tự coi những trang chưa tách trong repo là ngoại lệ hợp lệ.

## 5. Ví dụ hoàn chỉnh: trang danh sách hoạt động

Ví dụ này tạo một trang minh họa mới tên `ActivityCatalog`. Trong công việc thực tế, nếu chỉ sửa danh sách đang có thì sửa `pages/Activities/`, không tạo trang trùng chức năng.

### 5.1. Dùng service có sẵn

`src/services/activityService.js` đã có:

```js
getAllActivities: () => http.get('/activity/getAll'),
```

Hook chỉ gọi method này. Không import Axios hoặc `http` vào hook, View hay component.

### 5.2. Hook: quản lý request và state

File `src/pages/ActivityCatalog/useActivityCatalog.js`:

```js
import { useEffect, useState } from 'react'

import { mapActivitiesResponse } from '@/features/activity/activityMapper.js'
import activityService from '@/services/activityService.js'

export function useActivityCatalog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const fetchItems = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await activityService.getAllActivities()
        const nextItems = mapActivitiesResponse(response)

        if (!ignore) {
          setItems(nextItems)
        }
      } catch (err) {
        if (!ignore) {
          setItems([])
          setError(err)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchItems()

    return () => {
      ignore = true
    }
  }, [])

  return { items, loading, error }
}
```

`ignore` ngăn response cũ cập nhật state sau khi effect đã được dọn dẹp. Nó không hủy HTTP request. Nếu request phụ thuộc ID, đưa ID vào dependency của effect; không bỏ dependency để né cảnh báo lint.

### 5.3. View: đủ bốn trạng thái

File `src/pages/ActivityCatalog/ActivityCatalogView.jsx`:

```jsx
import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { buildActivityDetailPath } from '@/routes/paths.js'

export function ActivityCatalogView({
  items = [],
  loading = false,
  error = null,
}) {
  const { t } = useLanguage()

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {t('activityCatalog.title')}
      </h1>

      {loading ? (
        <p className="text-sm text-slate-500">
          {t('activityCatalog.loading')}
        </p>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">
          {t('activityCatalog.loadError')}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6">
          <h2 className="font-semibold text-slate-900">
            {t('activityCatalog.emptyTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {t('activityCatalog.emptyDescription')}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={buildActivityDetailPath(item.id)}
                className="font-semibold text-emerald-700 hover:underline"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
```

Tên hoạt động đến từ API nên giữ nguyên. Các nhãn và thông báo do ứng dụng tạo phải dịch. Ví dụ giả định API trả ID ổn định; nếu contract không bảo đảm ID thì phải xử lý dữ liệu đó trước khi tạo link và key.

### 5.4. Page: nối hook với View

File `src/pages/ActivityCatalog/ActivityCatalogPage.jsx`:

```jsx
import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { ActivityCatalogView } from './ActivityCatalogView.jsx'
import { useActivityCatalog } from './useActivityCatalog.js'

const ActivityCatalogPage = () => {
  const { t } = useLanguage()
  const catalog = useActivityCatalog()

  useDocumentTitle(t('activityCatalog.pageTitle'))

  return <ActivityCatalogView {...catalog} />
}

export default ActivityCatalogPage
```

Page dùng default export. View, component và hook dùng named export.

### 5.5. Thêm bản dịch ở cả hai file

Thêm thuộc tính này bên trong object `vi` của `src/locales/vi.js`:

```js
activityCatalog: {
  pageTitle: 'Danh sách hoạt động',
  title: 'Khám phá hoạt động',
  loading: 'Đang tải hoạt động...',
  loadError: 'Không tải được hoạt động. Vui lòng thử lại.',
  emptyTitle: 'Chưa có hoạt động',
  emptyDescription: 'Các hoạt động mới sẽ xuất hiện tại đây.',
},
```

Thêm cùng bộ key bên trong object `en` của `src/locales/en.js`:

```js
activityCatalog: {
  pageTitle: 'Activity catalog',
  title: 'Explore activities',
  loading: 'Loading activities...',
  loadError: 'Unable to load activities. Please try again.',
  emptyTitle: 'No activities yet',
  emptyDescription: 'New activities will appear here.',
},
```

### 5.6. Đăng ký route

Thêm vào object `ROUTES` trong `src/routes/paths.js`:

```js
activityCatalog: '/activity-catalog',
```

Import Page vào `src/app/App.jsx`, đặt cùng nhóm import trang:

```js
import ActivityCatalogPage from '@/pages/ActivityCatalog/ActivityCatalogPage.jsx'
```

Thêm route trong nhóm Public, trước route `ROUTES.notFound`:

```jsx
<Route
  path={ROUTES.activityCatalog}
  element={withMainLayout(<ActivityCatalogPage />)}
/>
```

Nếu tính năng chỉ dành cho USER, dùng `withRoles` thay vì route public:

```jsx
<Route
  path={ROUTES.activityCatalog}
  element={withRoles([USER_ROLES.user], <ActivityCatalogPage />)}
/>
```

Chọn một cách phù hợp yêu cầu, không khai báo cả hai route cùng URL. Khi thêm mục menu, sửa `src/components/layout/SiteHeader.jsx` và dùng `ROUTES.activityCatalog`.

## 6. Làm việc với service và response

Một domain có một service object: `activityService`, `groupService`, `buddyService`, `authService`. Thêm method vào service đã có trước khi nghĩ tới file mới.

- Mọi service dùng instance `@/services/http.js` để tận dụng base URL và Bearer token.
- Service thông thường trả nguyên Promise Axios; hook/mapper bóc response bằng helper.
- `authService` là ngoại lệ hiện có: đã bóc `.data` và chuẩn hóa lỗi. Đọc implementation trước khi thêm xử lý vào luồng login/register.
- Query dùng `{ params }`, không nối chuỗi query thủ công.
- Endpoint API là đường dẫn backend, được viết trong service; không dùng `ROUTES` cho endpoint. `ROUTES` dành cho điều hướng frontend.
- Khi backend trả cấu trúc mới, kiểm tra contract rồi cập nhật helper/mapper phù hợp. Không rải `response.data.data` khắp trang.

Các helper response hiện có:

| Helper | Mục đích |
| --- | --- |
| `getResponseList(response)` | Lấy danh sách từ các dạng response mà helper hỗ trợ |
| `getResponseData(response)` | Lấy payload object |
| `safeList(value)` | Trả mảng hoặc `[]` nếu giá trị không phải mảng |

Các helper này không phải bộ kiểm tra schema. Ví dụ response rỗng có thể cần kiểm tra thêm trường ID để xác nhận có bản ghi thật. Không map mọi payload rỗng thành một object đầy fallback rồi coi là dữ liệu hợp lệ.

## 7. Mapper: chuẩn hóa dữ liệu, không bịa dữ liệu

Mapper giúp View không phải biết backend dùng field nào hoặc có thiếu field hay không.

- Hoạt động dùng lại `features/activity/activityMapper.js`.
- Mapper dùng riêng một trang đặt cạnh hook của trang đó.
- Mapper dùng nhiều trang đặt trong feature thích hợp.
- Dùng `getValidImage()` cho ảnh, `getValidText()` cho text placeholder không hợp lệ.
- Fallback an toàn: chuỗi rỗng, `null`, `[]`, số 0 khi hợp ngữ nghĩa hoặc thông báo trung tính qua `t()`.
- Không suy ra người chủ trì hoặc user hiện tại từ phần tử đầu tiên của danh sách.
- Không tự gán rating, review, badge xác minh hoặc tên người khi API không cung cấp.

Phân biệt “không biết” và giá trị thật. Chẳng hạn thiếu rating không đồng nghĩa với 5 sao; thiếu host không có nghĩa thành viên đầu tiên là host. Nếu thiếu giá khiến UI hiểu thành miễn phí, cần xác định rõ contract backend trước khi chọn fallback.

## 8. Dùng đúng helper và component sẵn có

| Nhu cầu | Dùng lại |
| --- | --- |
| Tiền | `formatMoney()` |
| Ngày, giờ | `formatDate()`, `formatDateTime()`, `formatTimeRange()` |
| Nhãn enum | `formatEnumLabel()` hoặc formatter nghiệp vụ có sẵn |
| Ảnh hợp lệ | `getValidImage()` |
| Tên và chữ cái đầu | `getValidText()`, `getInitials()` |
| Role | `normalizeRole()` |
| Khung nội dung | `Container` |
| Quay lại | `BackButton` |
| Avatar | `UserAvatar` |
| Trường form và mật khẩu | `FormField`, `PasswordField` qua common barrel |
| Thông báo form | `AuthAlert` |
| Thương hiệu | `BrandLogo` |
| Điều khoản trước khi tham gia | `SafetyTermsModal` |

Đọc props của component trước khi dùng. Không dựng một avatar hoặc logo mới chỉ vì không biết component đã có. Hàm utils không import React; logic cần React chuyển sang hook.

## 9. Quy tắc i18n dễ bị bỏ sót

Trong component/hook lấy `t` bằng `useLanguage()`. Trong mapper/utils/service dùng `t` từ `@/utils/i18n.js`.

Phải dịch cả placeholder, alt dự phòng, aria-label, title, tiêu đề tab và thông báo validation. Dữ liệu API như tên người, tên hoạt động và mô tả không tự dịch.

```jsx
const { t } = useLanguage()

return (
  <button type="button" aria-label={t('nav.openMenu')}>
    {t('nav.openMenu')}
  </button>
)
```

Với nội dung có biến, dùng tham số bản dịch thay vì nối chuỗi. Ví dụ đã có trong repo:

```jsx
{t('buddy.activityCount', { count: hostedActivities.length })}
```

Mảng menu hoặc tab lưu `labelKey`, gọi `t(tab.labelKey)` lúc render. Không dịch sẵn ở cấp module vì chuỗi có thể bị giữ ở ngôn ngữ cũ.

Khi truyền thông báo qua router state, truyền key:

```js
navigate(ROUTES.userDashboard, {
  state: {
    activeTab: 'ACTIVITIES',
    messageKey: 'dashboard.joinSuccess',
  },
})
```

Ngày/giờ/tiền dùng helper chung để theo locale. LanguageProvider hiện mount lại cây con khi đổi ngôn ngữ, nên state cục bộ có thể được khởi tạo lại; cần kiểm tra hành vi này khi làm form.

## 10. Auth và phân quyền

Lấy user bằng `useAuth()`. Những field được chuẩn mô tả gồm `username`, `role`, `userId`, `buddyId`. Không tự đọc storage để dựng lại user trong một trang.

```js
import { USER_ROLES } from '@/constants/app.js'
import { useAuth } from '@/context/authContext.js'
import { normalizeRole } from '@/utils/role.js'

// Bên trong component hoặc hook
const { user } = useAuth()
const isBuddy = normalizeRole(user?.role) === USER_ROLES.buddy
```

Chỉ `AuthProvider.jsx`, `LanguageProvider.jsx` và `http.js` được truy cập localStorage, qua `STORAGE_KEYS`.

Sau đăng nhập dùng `getDefaultRouteByRole()`, hoặc quay lại route hợp lệ mà luồng hiện tại đã lưu. Khi kiểm tra người dùng trong danh sách thành viên, so sánh ID với `user.userId`, có xử lý kiểu dữ liệu theo contract.

`ProtectedRoute` hiện chặn theo trạng thái đăng nhập và role ở frontend. Nó không tự xử lý mọi HTTP 403 phát sinh từ request. Hook vẫn phải xử lý lỗi API, và backend vẫn phải thực thi quyền truy cập.

## 11. Loading, error, empty và thao tác ghi

Với danh sách, thứ tự render thông thường:

1. Đang tải → loading.
2. Request lỗi → error.
3. Request thành công, danh sách rỗng → empty.
4. Có dữ liệu → nội dung.

Với trang chi tiết, kết thúc request mà không có bản ghi phải hiện empty/not-found phù hợp. Không dùng điều kiện kiểu “không có error thì tiếp tục loading” vì có thể loading mãi.

Nếu màn hình tải hai nguồn dữ liệu độc lập, ví dụ hoạt động và đánh giá, nên có trạng thái phù hợp cho từng phần. Không bắt lỗi đánh giá rồi đổi thành `[]` và hiển thị “chưa có đánh giá” như thể request thành công.

Với thao tác tham gia, đăng ký hoặc lưu form:

- Handler nghiệp vụ ở hook, View nhận callback.
- Có state đang gửi và vô hiệu hóa nút gửi khi cần tránh gửi lặp.
- Validation dùng bản dịch.
- Khi thành công cập nhật state hoặc điều hướng theo luồng được yêu cầu.
- Khi thất bại giữ thông tin người dùng cần sửa và hiển thị lỗi.
- Nút gửi form dùng `type="submit"`; nút khác dùng `type="button"`.

Backend chưa có API: hiển thị trạng thái trống, thêm TODO nêu endpoint đang chờ. Không đưa dữ liệu mẫu vào để giả lập tính năng đã hoạt động.

## 12. Import, export, format và style

Thứ tự import: thư viện → alias `@/` → file trong cùng trang/feature, mỗi nhóm cách một dòng trống. Nhóm alias sắp theo alphabet đường dẫn.

```js
import { useState } from 'react'

import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

import { ActivityCatalogView } from './ActivityCatalogView.jsx'
```

Đây là ví dụ thứ tự; chỉ giữ import thực sự dùng trong file.

- Không dùng `../`.
- Import ngoài folder dùng alias `@/`.
- Ghi đuôi `.js`/`.jsx`; ngoại lệ được tài liệu cho phép là `@/components/common`.
- Component thường dùng `export function Xxx()`; Page dùng default export.
- File component PascalCase, hook là `useXxx.js`, service là `xxxService.js`.
- Dùng 2 space, nháy đơn trong JavaScript, không dấu chấm phẩy, CRLF. Thuộc tính JSX có thể dùng nháy kép như các ví dụ trong chuẩn.
- Tailwind viết trực tiếp trên JSX. Không tạo CSS riêng cho từng component.
- Màu chính emerald; navy + vàng chỉ áp dụng các khu vực ngoại lệ đã ghi trong chuẩn: header/brand, Home và AuthLayout.
- Không dùng inline style trừ giá trị động; không dùng `dangerouslySetInnerHTML`.
- File khoảng trên 250 dòng nên xem xét tách component có trách nhiệm rõ ràng.
- Thiết kế mobile-first, kiểm tra sidebar và các khối flex có tràn màn hình nhỏ không.

## 13. Quy trình làm một task từ đầu đến cuối

### Trước khi code

1. Đọc toàn bộ `HUONG_DAN_CAU_TRUC.md` và yêu cầu task.
2. Xác định route/trang, role được truy cập và dữ liệu cần lấy.
3. Đọc service, mapper, utils và component liên quan trước khi tạo mới.
4. Kiểm tra contract API: field, kiểu dữ liệu, payload, response rỗng và lỗi.
5. Xác định phần dùng riêng và phần dùng chung.

### Khi code

1. Bổ sung service nếu API đã được xác nhận và chưa có method tương ứng.
2. Viết hoặc tái sử dụng mapper.
3. Viết hook quản lý dữ liệu và handler.
4. Viết View đủ trạng thái và component con nếu cần.
5. Nối Page, route và menu nếu task yêu cầu.
6. Thêm VI/EN cùng lúc.
7. Kiểm tra lại việc dùng helper, import và role.

### Trước khi bàn giao

```bash
npm run build
npm run lint
node scripts/check-i18n.mjs
```

Sau đó kiểm tra thủ công các tình huống liên quan: đang tải, API lỗi, rỗng, có dữ liệu, đổi ngôn ngữ, màn hình nhỏ, đúng/sai role, nhấn submit nhiều lần và mở trực tiếp URL chi tiết.

Không thêm dependency hoặc sửa `package.json`, `vite.config.js`, `eslint.config.js` nếu task không yêu cầu. Chỉ cập nhật tài liệu chuẩn khi task thực sự tạo hoặc thay đổi quy ước, không vì một ví dụ hướng dẫn.

## 14. Những điểm cần lưu ý trong repo hiện tại

Các điểm dưới đây được ghi nhận ở lần scan ngày 29/09/2026. Đây là phần cần cải thiện, không phải mẫu để làm theo:

| Hiện trạng | Hướng xử lý khi làm task liên quan |
| --- | --- |
| UserDashboard và NotFound chưa tách đủ Page/View/hook | Tách trách nhiệm theo mục 4 |
| Admin và Forbidden chưa có hook theo cấu trúc bắt buộc | Bổ sung theo chuẩn hoặc thống nhất sửa chuẩn trước |
| ActivityDetail có thể hiển thị loading khi request rỗng | Phân biệt rõ đang tải với không có bản ghi |
| Mapper nhóm fallback host sang thành viên đầu tiên | Chỉ hiển thị host khi có dữ liệu xác định |
| Lỗi tải đánh giá Buddy bị coi như không có đánh giá | Tách trạng thái lỗi và rỗng |
| Một số alt/placeholder chưa qua i18n | Thêm key cả VI và EN |
| Một số ảnh chưa qua helper, nút thiếu type, màu lệch chuẩn | Rà soát lúc sửa component liên quan |
| Script check-i18n lỗi dynamic import trên Windows | Chuyển đường dẫn file sang file URL trước import |

Lỗi Windows của script nằm ở cách import `C:\...` trực tiếp. Hướng sửa kỹ thuật là import thêm `pathToFileURL` từ `node:url`, rồi dùng dạng:

```js
const { default: vi } = await import(
  pathToFileURL(path.join(root, 'src/locales/vi.js')).href,
)
```

Áp dụng tương tự cho `en.js`. Đoạn này chỉ hướng dẫn sửa; việc tạo tài liệu không tự sửa script trong repo.

Ở lần scan trước, build và ESLint pass khi gọi trực tiếp CLI bằng Node; kiểm tra i18n sau điều chỉnh import trong bộ nhớ cho kết quả 310 key hợp lệ. Các kết quả đó không thay thế việc chạy lại kiểm tra sau mỗi thay đổi. Script kiểm tra key cũng không chứng minh toàn bộ UI đã được dịch: chuỗi gõ cứng và một số key động vẫn cần review.

## 15. Checklist sử dụng nhanh

- [ ] Đã đọc chuẩn và hiểu phạm vi task.
- [ ] Mỗi route có folder, Page, View và hook đúng trách nhiệm.
- [ ] Không import chéo giữa các trang.
- [ ] UI dùng chung nằm trong components; nghiệp vụ dùng chung nằm trong features.
- [ ] API chỉ đi qua service và instance http.
- [ ] Dùng helper response và mapper có sẵn khi phù hợp.
- [ ] Không mock dữ liệu, không bịa rating/host/badge.
- [ ] Có loading, error, empty và nội dung thật.
- [ ] URL frontend dùng ROUTES hoặc buildXxxPath.
- [ ] Role được normalize, user lấy từ useAuth.
- [ ] Không truy cập localStorage ngoài file được phép.
- [ ] Text UI qua t(), đủ key VI và EN.
- [ ] Ảnh được kiểm tra, alt phù hợp, nút có type.
- [ ] Không console.log, không import thừa hoặc ../.
- [ ] Format CRLF, 2 space, không chấm phẩy.
- [ ] Build, lint và kiểm tra i18n đạt; nếu bị chặn phải ghi rõ nguyên nhân.
- [ ] Đã kiểm tra hành vi thực tế liên quan đến phần thay đổi.
- [ ] Nếu thay đổi quy ước, đã cập nhật HUONG_DAN_CAU_TRUC.md.
