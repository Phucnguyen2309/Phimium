import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { GEOCODE_STATUS } from '@/features/map/useAddressGeocode.js'

/** Nút "Lấy toạ độ từ địa chỉ" + dòng trạng thái (đang tìm / đã điền / không tìm thấy) */
export function AddressGeocodeStatus({ status, displayName, onRetry, disabled }) {
  const { t } = useLanguage()
  const loading = status === GEOCODE_STATUS.loading

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-2.5 sm:flex-row sm:items-center">
      <p className="min-w-0 flex-1 text-[11px] leading-5">
        {loading && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t('geocode.loading')}
          </span>
        )}
        {status === GEOCODE_STATUS.found && (
          <span className="text-emerald-700">
            <span className="font-bold">{t('geocode.found')}</span>{' '}
            <span className="text-slate-500">{displayName}</span>
          </span>
        )}
        {status === GEOCODE_STATUS.notFound && <span className="font-semibold text-amber-700">{t('geocode.notFound')}</span>}
        {status === GEOCODE_STATUS.error && <span className="font-semibold text-rose-600">{t('geocode.error')}</span>}
        {status === GEOCODE_STATUS.idle && <span className="text-slate-400">{t('geocode.hint')}</span>}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={disabled || loading}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-950 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-900 disabled:opacity-50"
      >
        <Icon name="map-pin" className="h-3.5 w-3.5" />
        {t('geocode.button')}
      </button>
    </div>
  )
}
