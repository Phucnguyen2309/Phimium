import { Link } from 'react-router-dom'

import { ROUTES } from '@/routes/paths.js'

export function ForbiddenView() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          403
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Bạn không có quyền truy cập
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Route này yêu cầu role khác với tài khoản hiện tại.
        </p>
        <Link
          to={ROUTES.home}
          className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white"
        >
          Về trang chủ
        </Link>
      </div>
    </section>
  )
}
