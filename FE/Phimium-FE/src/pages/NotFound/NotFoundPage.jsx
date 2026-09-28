import { Link } from 'react-router-dom'

import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import { ROUTES } from '@/routes/paths.js'

const NotFoundPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('errors.notFound.pageTitle'))

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          {t('errors.notFound.title')}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {t('errors.notFound.description')}
        </p>
        <Link
          to={ROUTES.home}
          className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          {t('errors.backHome')}
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
