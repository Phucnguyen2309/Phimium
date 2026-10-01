import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { AuthAlert, Icon, RatingStars } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

const MAX_COMMENT = 1000

function CommentField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, MAX_COMMENT))}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
      />
      <span className="mt-1 block text-right text-[11px] text-slate-400">
        {value.length}/{MAX_COMMENT}
      </span>
    </label>
  )
}

export function ReviewModal({ target, onClose, onSubmit }) {
  const { t } = useLanguage()
  const journey = target?.journey

  const [tourRating, setTourRating] = useState(target?.initialRating ?? 0)
  const [tourComment, setTourComment] = useState('')
  const [buddyRating, setBuddyRating] = useState(0)
  const [buddyComment, setBuddyComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  if (!journey) return null

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!tourRating) {
      setError(t('userDashboard.review.ratingRequired'))
      return
    }

    setError('')
    setSubmitting(true)

    const message = await onSubmit({
      tourRating,
      tourComment: tourComment.trim() || null,
      buddyRating: buddyRating || null,
      buddyComment: buddyComment.trim() || null,
    })

    if (message) {
      setError(message)
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-blue-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-xl animate-fade-up overflow-y-auto rounded-t-[1.75rem] bg-white p-6 shadow-2xl sm:rounded-[1.75rem] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-800">
              {t('userDashboard.review.modalEyebrow')}
            </p>
            <h2 id="review-modal-title" className="mt-1 text-xl font-extrabold leading-snug text-blue-950">
              {journey.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={t('common.close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            <Icon name="x-mark" className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {error && <AuthAlert>{error}</AuthAlert>}

          <div>
            <p className="text-sm font-bold text-blue-950">{t('userDashboard.review.tourRating')}</p>
            <RatingStars
              value={tourRating}
              onChange={setTourRating}
              size="h-8 w-8"
              label={t('userDashboard.review.tourRating')}
              className="mt-2"
            />
            <div className="mt-3">
              <CommentField
                label={t('userDashboard.review.tourComment')}
                value={tourComment}
                onChange={setTourComment}
                placeholder={t('userDashboard.review.tourCommentPlaceholder')}
              />
            </div>
          </div>

          {journey.buddyName && (
            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm font-bold text-blue-950">
                {t('userDashboard.review.buddyRating', { name: journey.buddyName })}
              </p>
              <RatingStars
                value={buddyRating}
                onChange={setBuddyRating}
                size="h-7 w-7"
                label={t('userDashboard.review.buddyRating', { name: journey.buddyName })}
                className="mt-2"
              />
              <div className="mt-3">
                <CommentField
                  label={t('userDashboard.review.buddyComment')}
                  value={buddyComment}
                  onChange={setBuddyComment}
                  placeholder={t('userDashboard.review.buddyCommentPlaceholder', { name: journey.buddyName })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="shine inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-extrabold text-blue-950 shadow-sm transition hover:bg-yellow-300 disabled:opacity-70"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {submitting ? t('common.processing') : t('userDashboard.review.submit')}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
