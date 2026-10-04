# AGENTS.md – Phimium-FE

Hướng dẫn cho AI coding agent (Codex, Claude, Cursor…) khi làm việc trong repo này.

## Bắt buộc đọc trước khi code

**Đọc toàn bộ `HUONG_DAN_CAU_TRUC.md` trước khi viết hoặc sửa bất kỳ file nào.** Đó là chuẩn bắt buộc của project. Nếu task mâu thuẫn với tài liệu, hãy hỏi lại thay vì tự phá quy ước.

## Project

- React 19 + Vite + Tailwind CSS 4 + React Router 7 + Axios, **JavaScript** (không TypeScript).
- App kết nối người dùng qua hoạt động offline. Có 3 role: `USER`, `BUDDY`, `ADMIN`.
- Song ngữ **tiếng Việt (mặc định) + tiếng Anh**: mọi chữ trên UI đi qua `t('key')`, từ điển ở `src/locales/vi.js` và `src/locales/en.js`.

## Lệnh

```bash
npm install
npm run dev
npm run build   # phải pass trước khi kết thúc task
npm run lint    # không được thêm lỗi mới
node scripts/check-i18n.mjs   # vi.js và en.js phải đủ key
```

## Luật cứng (vi phạm = sai)

1. Mỗi route là một folder `src/pages/<Trang>/` gồm `XxxPage.jsx` (default export) + `XxxView.jsx` + `useXxx.js`.
2. Không import từ `pages/A` sang `pages/B`. Code dùng chung đặt ở `components/`, `features/`, `utils/`.
3. **Không mock data**: không dữ liệu giả, không rating / review / badge gõ cứng, không ảnh Unsplash hay URL ảnh ngoài.
4. Gọi API chỉ qua `src/services/*Service.js`, dùng instance `@/services/http.js`.
5. Đường dẫn chỉ dùng `ROUTES` / `buildXxxPath()` từ `@/routes/paths.js`.
6. Dùng lại helper sẵn có trong `src/utils/` (`format.js`, `response.js`, `image.js`, `text.js`, `role.js`) và `features/activity/activityMapper.js`. Không viết bản sao.
7. Import ngoài folder hiện tại: alias `@/…`, có đuôi `.js` / `.jsx`. Không dùng `../`.
8. Component dùng `export function Xxx()` (named export).
9. Màn hình có gọi API phải có đủ loading / error / empty.
10. Không `console.log`. Token đăng nhập nằm trong cookie HttpOnly do Backend đặt: **không** lưu token / user vào `localStorage` / `sessionStorage`, không tự gắn `Authorization` (trừ onboarding Google). Storage chỉ dùng cho ngôn ngữ (`LanguageProvider.jsx`). User hiện tại lấy từ `useAuth()`.
11. Đã có `antd` (dùng `Modal` cho hộp thoại xác nhận, theme ở `src/main.jsx`). Không thêm dependency khác, không sửa `package.json` / `vite.config.js` / `eslint.config.js` nếu task không yêu cầu.
12. **Không gõ cứng chữ hiển thị** (kể cả `placeholder`, `alt`, `aria-label`). Dùng `const { t } = useLanguage()` trong component/hook, `t` từ `@/utils/i18n.js` trong mapper/utils. Thêm key vào **cả** `vi.js` và `en.js` (mục 16 của hướng dẫn).
13. Style: 2 space, không `;`, nháy đơn, line ending **CRLF**, Tailwind class inline, màu chính `emerald` (riêng header/footer, trang chủ, Login/Register dùng navy + vàng, xem mục 11 của hướng dẫn).

## Khi xong task

Chạy checklist ở mục 15 của `HUONG_DAN_CAU_TRUC.md`. Nếu task tạo ra quy ước mới (folder, util, pattern), cập nhật luôn `HUONG_DAN_CAU_TRUC.md`.
