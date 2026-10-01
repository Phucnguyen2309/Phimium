import { useState } from 'react'

import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { getInitials } from '@/utils/text.js'

import { PhotoLightbox } from './PhotoLightbox.jsx'

const MAX_TILES = 5

// Vị trí ô trong lưới 4 cột x 2 hàng theo số ảnh hiển thị (ô đầu luôn là ảnh lớn)
const TILE_LAYOUTS = {
  1: ['col-span-4 row-span-2'],
  2: ['col-span-2 row-span-2', 'col-span-2 row-span-2'],
  3: ['col-span-2 row-span-2', 'col-span-2', 'col-span-2'],
  4: ['col-span-2 row-span-2', 'col-span-2', 'col-span-1', 'col-span-1'],
  5: ['col-span-2 row-span-2', 'col-span-1', 'col-span-1', 'col-span-1', 'col-span-1'],
}

const hideBrokenImage = (event) => {
  event.currentTarget.style.visibility = 'hidden'
}

function Placeholder({ activity }) {
  return (
    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 sm:aspect-[21/9]">
      <span className="font-display text-7xl font-bold text-yellow-400/90">{getInitials(activity.title, 'P')}</span>
    </div>
  )
}

export function DetailGallery({ activity }) {
  const { t } = useLanguage()
  const [viewerIndex, setViewerIndex] = useState(null)
  const [mobileIndex, setMobileIndex] = useState(0)

  const images = activity.images ?? []
  const total = images.length

  if (total === 0) return <Placeholder activity={activity} />

  const tiles = images.slice(0, MAX_TILES)
  const layout = TILE_LAYOUTS[tiles.length]
  const hiddenCount = total - tiles.length

  const locationChip = activity.locationName && (
    <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl bg-blue-950/80 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur">
      <Icon name="map-pin" className="h-4 w-4 text-yellow-400" />
      {activity.locationName}
    </span>
  )

  return (
    <>
      {/* Điện thoại: vuốt ngang từng ảnh */}
      <div className="relative sm:hidden">
        <div
          className="flex snap-x snap-mandatory no-scrollbar overflow-x-auto rounded-[1.5rem]"
          onScroll={(event) => {
            const { scrollLeft, clientWidth } = event.currentTarget
            setMobileIndex(Math.round(scrollLeft / clientWidth))
          }}
        >
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setViewerIndex(index)}
              className="relative aspect-[4/3] w-full shrink-0 snap-center bg-blue-950"
            >
              <img
                src={url}
                alt={t('activityDetail.gallery.photoAlt', { title: activity.title, index: index + 1 })}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={hideBrokenImage}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
        {locationChip}
        {total > 1 && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-blue-950/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            {mobileIndex + 1}/{total}
          </span>
        )}
      </div>

      {/* Máy tính / tablet: lưới ảnh lớn + ảnh nhỏ */}
      <div className="hidden h-[26rem] grid-cols-4 grid-rows-2 gap-2.5 overflow-hidden rounded-[1.75rem] sm:grid lg:h-[30rem] 2xl:h-[34rem]">
        {tiles.map((url, index) => {
          const isLast = index === tiles.length - 1
          const showMore = isLast && hiddenCount > 0

          return (
            <button
              key={url}
              type="button"
              onClick={() => setViewerIndex(index)}
              aria-label={
                showMore
                  ? t('activityDetail.gallery.viewAll', { count: total })
                  : t('activityDetail.gallery.photoAlt', { title: activity.title, index: index + 1 })
              }
              className={`group/tile relative overflow-hidden bg-blue-950 ${layout[index]}`}
            >
              <img
                src={url}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={hideBrokenImage}
                className="h-full w-full object-cover transition duration-700 group-hover/tile:scale-105"
              />
              <span className="absolute inset-0 bg-blue-950/0 transition duration-300 group-hover/tile:bg-blue-950/15" />

              {showMore && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-blue-950/65 text-white backdrop-blur-[2px] transition group-hover/tile:bg-blue-950/75">
                  <Icon name="rectangle-stack" className="h-7 w-7" />
                  <span className="text-sm font-bold">{t('activityDetail.gallery.viewAll', { count: total })}</span>
                </span>
              )}

              {index === 0 && (
                <>
                  {activity.locationName && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-blue-950/70 to-transparent" />
                  )}
                  {locationChip}
                  {total > 1 && hiddenCount === 0 && (
                    <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-blue-950 shadow-sm">
                      <Icon name="rectangle-stack" className="h-4 w-4" />
                      {t('activityDetail.gallery.photoCount', { count: total })}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      {viewerIndex !== null && (
        <PhotoLightbox
          images={images}
          index={viewerIndex}
          title={activity.title}
          onChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  )
}
