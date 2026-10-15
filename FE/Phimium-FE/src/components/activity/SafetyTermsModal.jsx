import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

const TERMS = [
  { id: 'term1', icon: 'clock' },
  { id: 'term2', icon: 'user-group' },
  { id: 'term3', icon: 'shield-check' },
]

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
      if (event.key === 'Escape' && open && !loading) {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, loading, onClose])

  if (!open) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-blue-950/60 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-terms-title"
        className="relative flex max-h-[92svh] w-full max-w-lg animate-fade-up flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_40px_80px_-30px_rgba(22,36,86,0.6)] sm:rounded-[1.75rem]"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300" />

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-950 text-yellow-400 shadow-[0_12px_24px_-12px_rgba(22,36,86,0.8)]">
              <Icon name="shield-check" className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-800">
                {t('safetyTerms.eyebrow')}
              </p>
              <h2 id="safety-terms-title" className="mt-1 text-xl font-extrabold tracking-tight text-blue-950 sm:text-2xl">
                {t('safetyTerms.title')}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label={t('common.close')}
              className="-mr-2 -mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-blue-950 disabled:opacity-50"
            >
              <Icon name="x-mark" className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">{t('safetyTerms.subtitle')}</p>

          <ul className="mt-5 space-y-2.5">
            {TERMS.map((term) => (
              <li key={term.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-900 shadow-sm">
                  <Icon name={term.icon} className="h-5 w-5" />
                </span>
                <p className="pt-1.5 text-sm leading-6 text-slate-700">{t(`safetyTerms.${term.id}`)}</p>
              </li>
            ))}
          </ul>

          <label
            className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
              checked
                ? 'border-yellow-400 bg-yellow-50/70'
                : 'border-dashed border-slate-300 hover:border-blue-900/40 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => onCheckedChange(event.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-blue-900/40 peer-focus-visible:ring-offset-2 ${
                checked ? 'border-blue-950 bg-blue-950 text-yellow-400' : 'border-slate-300 bg-white'
              }`}
            >
              {checked && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span className={`text-sm leading-6 ${checked ? 'font-semibold text-blue-950' : 'text-slate-700'}`}>
              {t('safetyTerms.agree')}
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-blue-950 disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={!checked || loading}
            onClick={onConfirm}
            className="shine inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-extrabold text-blue-950 shadow-[0_14px_30px_-14px_rgba(253,199,0,0.9)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Icon name="check-circle" className="h-4 w-4" />
            )}
            {loading ? t('common.processing') : t('safetyTerms.confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
