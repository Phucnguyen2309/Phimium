# Hướng Dẫn Sử Dụng Cấu Trúc FE

Project này dùng React, JavaScript, Vite và Tailwind CSS. Cấu trúc được chia theo trách nhiệm để dễ mở rộng khi thêm trang, component, API hoặc tính năng mới.

## Cây thư mục chính

```text
src/
  app/             File gốc của app
  assets/          Hình ảnh, icon, font, file tĩnh import trong code
  components/      Component dùng lại nhiều nơi
  constants/       Giá trị cố định dùng chung
  features/        Module theo từng tính năng lớn
  hooks/           Custom React hooks
  layouts/         Layout khung trang
  pages/           Các màn hình/trang chính
  routes/          Khai báo đường dẫn route
  services/        Gọi API, xử lý request
  utils/           Hàm tiện ích nhỏ
```

## Cách dùng từng thư mục

### `src/app`

Chứa file gốc của ứng dụng, hiện tại là `App.jsx`.

Dùng để ráp layout, router, provider hoặc config cấp toàn app.

Ví dụ:

```jsx
import { MainLayout } from '@/layouts/MainLayout.jsx'
import { HomePage } from '@/pages/HomePage.jsx'

function App() {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  )
}

export default App
```

### `src/pages`

Chứa các trang chính, mỗi route thường có một page.

Ví dụ:

```text
pages/
  HomePage.jsx
  LoginPage.jsx
  MovieDetailPage.jsx
  ProfilePage.jsx
```

Khi thêm trang mới, tạo file trong `pages`, sau đó gắn vào router hoặc `App.jsx`.

### `src/layouts`

Chứa khung giao diện dùng chung như header, footer, sidebar.

Ví dụ:

```text
layouts/
  MainLayout.jsx
  AdminLayout.jsx
  AuthLayout.jsx
```

Nếu trang user và trang admin có giao diện khác nhau, tạo layout riêng.

### `src/components`

Chứa component dùng lại nhiều nơi.

Ví dụ:

```text
components/
  common/
    Button.jsx
    Container.jsx
    Input.jsx
    Modal.jsx
```

Quy tắc đơn giản:

- Component chỉ dùng cho một tính năng thì để trong `features`.
- Component dùng nhiều nơi thì để trong `components`.

### `src/features`

Chứa code theo từng tính năng lớn của app.

Ví dụ app phim có thể chia:

```text
features/
  auth/
    components/
    services/
    hooks/
  movies/
    components/
    services/
    hooks/
  users/
    components/
    services/
    hooks/
```

Khi tính năng bắt đầu có nhiều component/API/hook riêng, nên gom vào `features` để dễ quản lý.

### `src/services`

Chứa code gọi API hoặc cấu hình HTTP.

Ví dụ:

```text
services/
  http.js
  authService.js
  movieService.js
```

Ví dụ gọi API:

```js
import { httpRequest } from '@/services/http.js'

export function getMovies() {
  return httpRequest('/movies')
}
```

### `src/hooks`

Chứa custom hook dùng lại.

Ví dụ:

```text
hooks/
  useDocumentTitle.js
  useDebounce.js
  useLocalStorage.js
```

Hook nên bắt đầu bằng chữ `use`.

### `src/constants`

Chứa các giá trị cố định dùng chung, tránh viết lặp hard-code.

Ví dụ:

```js
export const APP_NAME = 'Phimium'

export const STORAGE_KEYS = {
  token: 'phimium_token',
  user: 'phimium_user',
}
```

Nên đặt ở đây:

- Tên app
- Role user
- Key localStorage
- Danh sách status
- Giá trị mặc định

### `src/routes`

Chứa khai báo đường dẫn.

Ví dụ:

```js
export const ROUTES = {
  home: '/',
  movies: '/movies',
  login: '/login',
}
```

Khi dùng route ở nhiều nơi, import từ đây để tránh sai chính tả.

### `src/utils`

Chứa hàm helper nhỏ, không phụ thuộc React.

Ví dụ:

```text
utils/
  cn.js
  formatDate.js
  formatCurrency.js
```

Ví dụ:

```js
export function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}
```

### `src/assets`

Chứa ảnh, icon, font hoặc file tĩnh cần import trong code.

Ví dụ:

```jsx
import heroImage from '@/assets/hero.png'
```

File trong `public` thì dùng trực tiếp bằng URL, ví dụ `/favicon.svg`.

## Quy trình thêm một trang mới

Ví dụ muốn thêm trang danh sách phim:

1. Tạo file `src/pages/MoviesPage.jsx`
2. Tạo route path trong `src/routes/paths.js`
3. Nếu có gọi API, thêm hàm trong `src/services/movieService.js`
4. Nếu có component riêng cho phim, đặt trong `src/features/movies/components`
5. Import page vào router hoặc `App.jsx`

Ví dụ page:

```jsx
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

export function MoviesPage() {
  useDocumentTitle('Movies')

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold text-white">Movies</h1>
    </section>
  )
}
```

## Quy tắc import

Project đã cấu hình alias `@` trỏ tới `src`.

Nên dùng:

```js
import { Container } from '@/components/common/Container.jsx'
import { APP_NAME } from '@/constants/app.js'
```

Hạn chế dùng:

```js
import { Container } from '../../components/common/Container.jsx'
```

Alias giúp import ngắn hơn và dễ di chuyển file hơn.

## Quy tắc đặt tên

```text
Component:       PascalCase.jsx     VD: MovieCard.jsx
Page:            PascalCase.jsx     VD: HomePage.jsx
Hook:            useSomething.js    VD: useDocumentTitle.js
Service:         camelCase.js       VD: movieService.js
Utils:           camelCase.js       VD: formatDate.js
Constants:       camelCase.js       VD: app.js
```

## Chạy project

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```

Kiểm tra lint:

```bash
npm run lint
```

## Gợi ý mở rộng tiếp

Khi app lớn hơn, có thể thêm:

```text
src/
  providers/       Context providers
  store/           State management
  mocks/           Mock data khi chưa có API
  styles/          File style global bổ sung nếu cần
```

Hiện tại chưa cần tạo quá nhiều folder nếu chưa dùng tới. Tạo khi có nhu cầu thật sẽ dễ giữ project gọn hơn.
