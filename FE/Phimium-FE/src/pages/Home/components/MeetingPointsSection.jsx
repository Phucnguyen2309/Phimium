import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

const DOT_COLORS = ['bg-blue-900', 'bg-yellow-400', 'bg-blue-500', 'bg-orange-400', 'bg-sky-300']

// Vị trí trang trí cho các ghim trên khung bản đồ (không phải toạ độ thật)
const PIN_POSITIONS = [
  'left-[22%] top-[30%]',
  'left-[58%] top-[22%]',
  'left-[42%] top-[58%]',
  'left-[72%] top-[62%]',
  'left-[30%] top-[76%]',
]

const buildMapSearchUrl = (point) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [point.name, point.address].filter(Boolean).join(', '),
  )}`

export function MeetingPointsSection({ meetingPoints = [] }) {
  const { t } = useLanguage()

  if (meetingPoints.length === 0) return null

  return (
    <section className="bg-white py-20">
      <Container>
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              {t('home.meetingPoints.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-blue-950">
              {t('home.meetingPoints.title')}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {t('home.meetingPoints.subtitle')}
            </p>

            <ul className="mt-6 space-y-3">
              {meetingPoints.map((point, index) => (
                <li key={point.id}>
                  <a
                    href={buildMapSearchUrl(point)}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50"
                  >
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        DOT_COLORS[index % DOT_COLORS.length]
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-blue-950 group-hover:text-blue-700">
                        {point.name}
                      </span>
                      {point.address && point.address !== point.name && (
                        <span className="block truncate text-xs text-slate-500">
                          {point.address}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden="true"
            className="relative h-72 overflow-hidden rounded-2xl bg-blue-50 sm:h-80"
          >
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(30,58,138,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,138,0.08) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="absolute -left-10 top-1/2 h-24 w-[140%] -rotate-12 rounded-full bg-sky-200/70" />
            <div className="absolute left-1/3 top-0 h-full w-3 rotate-12 bg-white/80" />
            <div className="absolute left-0 top-1/3 h-3 w-full -rotate-3 bg-white/80" />

            {meetingPoints.map((point, index) => (
              <span
                key={point.id}
                className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-xs font-black shadow-lg ${
                  PIN_POSITIONS[index % PIN_POSITIONS.length]
                } ${DOT_COLORS[index % DOT_COLORS.length]} ${
                  index === 1 ? 'text-blue-950' : 'text-white'
                }`}
              >
                {index + 1}
              </span>
            ))}

            <span className="absolute bottom-4 right-4 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-950 shadow">
              {t('home.meetingPoints.city')}
            </span>
          </div>
        </div>
      </Container>
    </section>
  )
}
