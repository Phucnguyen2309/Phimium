import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

/**
 * Xem ảnh toàn màn hình: mũi tên trái/phải, Esc để đóng, vuốt trên điện thoại, dải ảnh nhỏ bên dưới.
 */
export function PhotoLightbox({ images, index, title, onChange, onClose }) {
  const { t } = useLanguage()
  const touchStartX = useRef(null)
  const thumbsRef = useRef(null)
  const total = images.length

  const go = (delta) => onChange((index + delta + total) % total)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onChange((index + 1) % total)
      if (event.key === 'ArrowLeft') onChange((index - 1 + total) % total)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [index, total, onChange, onClose])

  // Giữ ảnh nhỏ đang chọn luôn trong tầm nhìn
  useEffect(() => {
    thumbsRef.current?.children[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [index])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('activityDetail.gallery.viewerLabel', { title })}
      className="fixed inset-0 z-[1000] flex flex-col bg-blue-950/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <p className="min-w-0 truncate text-sm font-semibold">
          <span className="text-yellow-400">{index + 1}</span>
          <span className="text-blue-200"> / {total}</span>
          <span className="ml-3 hidden text-blue-100 sm:inline">{title}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <Icon name="x-mark" className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return
          const deltaX = event.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(deltaX) > 50) go(deltaX < 0 ? 1 : -1)
          touchStartX.current = null
        }}
      >
        <img
          key={images[index]}
          src={images[index]}
          alt={t('activityDetail.gallery.photoAlt', { title, index: index + 1 })}
          className="max-h-full max-w-full animate-pop-in rounded-xl object-contain shadow-2xl"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t('activityDetail.gallery.previous')}
              className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:left-4 sm:flex"
            >
              <Icon name="chevron-left" className="h-6 w-6" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t('activityDetail.gallery.next')}
              className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:right-4 sm:flex"
            >
              <Icon name="chevron-right" className="h-6 w-6" strokeWidth={2} />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div ref={thumbsRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-4 sm:justify-center">
          {images.map((url, thumbIndex) => (
            <button
              key={url}
              type="button"
              onClick={() => onChange(thumbIndex)}
              aria-label={t('activityDetail.gallery.photoAlt', { title, index: thumbIndex + 1 })}
              aria-current={thumbIndex === index}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                thumbIndex === index ? 'ring-2 ring-yellow-400' : 'opacity-50 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  )
}
