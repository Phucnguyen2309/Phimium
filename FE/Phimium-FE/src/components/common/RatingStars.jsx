import { useState } from 'react'

import { useLanguage } from '@/context/languageContext.js'

const STAR_PATH =
  'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'

function Star({ filled, className }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      fill={filled ? 'currentColor' : 'none'}
      className={className}
    >
      <path strokeLinejoin="round" d={STAR_PATH} />
    </svg>
  )
}

/**
 * Hàng sao 1–5.
 * - Chỉ hiển thị: <RatingStars value={4} />
 * - Chọn điểm: <RatingStars value={rating} onChange={setRating} label="..." />
 */
export function RatingStars({ value = 0, onChange, size = 'h-5 w-5', label, className = '' }) {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(0)
  const shown = hovered || Math.round(value)

  if (!onChange) {
    return (
      <span
        role="img"
        aria-label={t('rating.value', { value: Math.round(value) })}
        className={`inline-flex items-center gap-0.5 text-yellow-500 ${className}`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} filled={star <= shown} className={size} />
        ))}
      </span>
    )
  }

  return (
    <span
      role="radiogroup"
      aria-label={label ?? t('rating.choose')}
      onMouseLeave={() => setHovered(0)}
      className={`inline-flex items-center gap-0.5 ${className}`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={Math.round(value) === star}
          aria-label={t('rating.value', { value: star })}
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(0)}
          onClick={() => onChange(star)}
          className={`rounded-md p-0.5 transition duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/40 ${
            star <= shown ? 'text-yellow-500' : 'text-slate-300'
          }`}
        >
          <Star filled={star <= shown} className={size} />
        </button>
      ))}
    </span>
  )
}
