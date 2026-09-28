import { useEffect } from 'react'

import { useLanguage } from '@/context/languageContext.js'

export function SafetyTermsModal({
  open,
  checked,
  onCheckedChange,
  onClose,
  onConfirm,
  loading,
}) {
  const { t } = useLanguage()

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              {t('safetyTerms.eyebrow')}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {t('safetyTerms.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {t('common.close')}
          </button>
        </div>

        <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <p>{t('safetyTerms.term1')}</p>
          <p>{t('safetyTerms.term2')}</p>
          <p>{t('safetyTerms.term3')}</p>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
          />
          <span className="text-sm leading-6 text-slate-700">
            {t('safetyTerms.agree')}
          </span>
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={!checked || loading}
            onClick={onConfirm}
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('common.processing') : t('safetyTerms.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
