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
  app/             App root and app-level providers
  assets/          Images, fonts, and static imports
  components/      Shared reusable UI components
  constants/       App-wide constants
  features/        Feature modules such as movies or auth
  hooks/           Shared React hooks
  layouts/         Page shells and layout components
  pages/           Route-level screens
  routes/          Route path constants and router setup
  services/        API clients and external services
  utils/           Small shared helper functions
```

## Environment

Create `.env` when the API is ready:

```env
VITE_API_BASE_URL=http://localhost:8080
```
