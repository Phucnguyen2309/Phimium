import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

const COMMITMENT_IDS = ['localBuddy', 'safetyTerms', 'smallGroups', 'clearPricing']

const TOUR_KEYS = ['home.marquee.foodTour', 'home.marquee.historyTour']

/** Dải chữ chạy ngang liên tục: 2 dòng tour + các cam kết của Phimium. */
export function HighlightMarquee() {
  const { t } = useLanguage()

  const items = [
    ...TOUR_KEYS.map((key) => t(key)),
    ...COMMITMENT_IDS.map((id) => t(`home.commitments.${id}.title`)),
  ]

  // Nhân đôi danh sách để vòng chạy liền mạch
  const loop = [...items, ...items]

  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-y border-yellow-500/40 bg-yellow-400 py-4 text-blue-950"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-yellow-400 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-yellow-400 to-transparent" />

      <div className="marquee-track flex w-max animate-marquee items-center gap-10">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-10 whitespace-nowrap font-display text-lg font-bold italic"
          >
            {item}
            <Icon name="sparkles" className="h-4 w-4 not-italic" />
          </span>
        ))}
      </div>
    </div>
  )
}
