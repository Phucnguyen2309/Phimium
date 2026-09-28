import { useLanguage } from '@/context/languageContext.js'

export function AdminView() {
  const { t } = useLanguage()

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          {t('admin.title')}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {t('admin.description')}
        </p>
      </div>
    </section>
  )
}
