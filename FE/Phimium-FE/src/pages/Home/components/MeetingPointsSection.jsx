import { useState } from 'react'

import { Container, Icon, Reveal } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { PointsMap } from '@/features/map/PointsMap.jsx'
import { buildDirectionsUrl, hasValidCoordinates } from '@/utils/geo.js'

import { SectionHeading } from './SectionHeading.jsx'

export function MeetingPointsSection({ meetingPoints = [] }) {
  const { t } = useLanguage()
  const [activeId, setActiveId] = useState(null)

  if (meetingPoints.length === 0) return null

  return (
    <section className="bg-white py-24 sm:py-28">
      <Container>
        <Reveal className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <SectionHeading
              align="left"
              eyebrow={t('home.meetingPoints.eyebrow')}
              title={t('home.meetingPoints.title')}
              subtitle={t('home.meetingPoints.subtitle')}
            />

            <ul className="mt-10 space-y-2">
              {meetingPoints.map((point, index) => {
                const isActive = point.id === activeId
                const hasCoordinates = hasValidCoordinates(point)

                return (
                  <li
                    key={point.id}
                    className={`group flex items-center gap-2 rounded-2xl border pr-2 transition duration-300 ${
                      isActive
                        ? 'border-blue-900/15 bg-slate-50 shadow-sm'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveId(point.id)}
                      className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold transition duration-300 ${
                          isActive
                            ? 'bg-blue-950 text-yellow-400'
                            : 'bg-slate-100 text-blue-950'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-blue-950">
                          {point.name}
                        </span>
                        {point.address && point.address !== point.name && (
                          <span className="block truncate text-xs text-slate-500">
                            {point.address}
                          </span>
                        )}
                        {!hasCoordinates && (
                          <span className="mt-0.5 block text-[11px] text-slate-400">
                            {t('map.pointNoCoordinates')}
                          </span>
                        )}
                      </span>
                    </button>

                    <a
                      href={buildDirectionsUrl(point)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t('map.directionsTo', { name: point.name })}
                      title={t('map.directions')}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition duration-300 hover:bg-yellow-400 hover:text-blue-950 ${
                        isActive ? 'text-yellow-600' : 'text-slate-300 group-hover:text-slate-500'
                      }`}
                    >
                      <Icon name="arrow-right" className="h-4 w-4 -rotate-45" strokeWidth={2} />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="relative">
            <PointsMap
              points={meetingPoints}
              activeId={activeId}
              onSelect={setActiveId}
              className="h-80 rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(22,36,86,0.45)] ring-1 ring-slate-200/80 sm:h-[26rem]"
            />

            <span className="pointer-events-none absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-blue-950 shadow-md backdrop-blur">
              <Icon name="map" className="h-4 w-4 text-yellow-600" />
              {t('home.meetingPoints.city')}
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
