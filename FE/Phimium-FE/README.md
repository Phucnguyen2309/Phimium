# Phimium FE

Frontend React app using JavaScript, Vite, and Tailwind CSS.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Structure

```text
src/
  app/          App root + router
  assets/       Images imported in code
  components/   Shared UI (common, layout, activity)
  constants/    App-wide constants
  context/      Auth context
  features/     Modules reused across pages (activity, myActivities, myGroups)
  hooks/        Shared React hooks
  layouts/      Page shells
  pages/        One folder per route (XxxPage + XxxView + useXxx)
  routes/       Route paths + ProtectedRoute
  services/     API clients
  utils/        Pure helper functions
```

Xem chi tiết quy ước trong `HUONG_DAN_CAU_TRUC.md`.

## Environment

Copy `.env.example` thành `.env` rồi chỉnh:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=<giống GOOGLE_CLIENT_ID của Backend>
```

Đăng nhập Google: trong Google Cloud Console → OAuth Client ID (Web), thêm `http://localhost:5173` và domain Vercel vào **Authorized JavaScript origins**. Sửa `.env` xong phải chạy lại `npm run dev`.
