import { AuthAlert, Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import {
  DEPARTURE_STATUS,
  formatDepartureDate,
  formatDepartureTime,
  formatPrice,
} from '@/features/activity/activityMapper.js'

function Stepper({ label, hint, value, min, onChange, disableIncrease }) {
  const { t } = useLanguage()
  const buttonClass =
    'flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-blue-950 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span>
        <span className="block text-sm font-bold text-blue-950">{label}</span>
        <span className="block text-[11px] text-slate-500">{hint}</span>
      </span>
      <span className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('activityDetail.booking.decrease', { label })}
          disabled={value <= min}
          onClick={() => onChange(-1)}
          className={buttonClass}
        >
          −
        </button>
        <span aria-live="polite" className="w-5 text-center text-base font-extrabold text-blue-950">
          {value}
        </span>
        <button
          type="button"
          aria-label={t('activityDetail.booking.increase', { label })}
          disabled={disableIncrease}
          onClick={() => onChange(1)}
          className={buttonClass}
        >
          +
        </button>
      </span>
    </div>
  )
}

function SectionLabel({ children, extra }) {
  return (
    <p className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
      {children}
      {extra}
    </p>
  )
}

export function BookingCard({
  activeDate,
  activity,
  adultCount,
  applyCoupon,
  booking,
  bookingError,
  changeGuests,
  childCount,
  clearCoupon,
  couponCode,
  couponInput,
  dateGroups,
  isAuthenticated,
  maxGuests,
  pickupLocation,
  pickupMax,
  price,
  quote,
  quoteLoading,
  selectDate,
  selectDeparture,
  selectedDeparture,
  sessions,
  setCouponInput,
  setPickupLocation,
  startBooking,
  totalGuests,
}) {
  const { t } = useLanguage()
  const childFee = activity.childParticipationFee
  const atLimit = maxGuests > 0 && totalGuests >= maxGuests
  const hasDepartures = dateGroups.length > 0

  return (
    <aside className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_30px_70px_-40px_rgba(22,36,86,0.55)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="whitespace-nowrap">
          <span className="text-2xl font-extrabold tracking-tight text-blue-950 xl:text-[1.75rem]">
            {formatPrice(activity.participationFee)}
          </span>
          <span className="ml-1 text-sm text-slate-500">{t('activities.card.perGuest')}</span>
        </p>
        {childFee !== null && childFee !== undefined && Number(childFee) !== Number(activity.participationFee) && (
          <span className="rounded-md bg-yellow-100 px-2 py-1 text-[11px] font-bold text-yellow-800">
            {t('activities.card.childPrice', { price: formatPrice(childFee) })}
          </span>
        )}
      </div>

      {!hasDepartures ? (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          {t('activityDetail.booking.noDepartures')}
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <div>
            <SectionLabel>{t('activityDetail.booking.date')}</SectionLabel>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {dateGroups.map((group) => {
                const isActive = group.date === activeDate
                const isFull = group.departures.every((item) => item.status === DEPARTURE_STATUS.full)

                return (
                  <button
                    key={group.date}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => selectDate(group.date)}
                    className={`shrink-0 rounded-xl px-3.5 py-2 text-left text-xs font-bold capitalize transition ${
                      isActive
                        ? 'bg-blue-950 text-white shadow-md'
                        : 'bg-slate-50 text-blue-950 ring-1 ring-slate-200 hover:bg-slate-100'
                    } ${isFull ? 'opacity-60' : ''}`}
                  >
                    {formatDepartureDate(group.start)}
                    {isFull && <span className="block text-[10px] font-semibold opacity-80">{t('activities.card.sessionFull')}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <SectionLabel>{t('activityDetail.booking.session')}</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {sessions.map((departure) => {
                const isFull = departure.status === DEPARTURE_STATUS.full
                const isActive = selectedDeparture?.id === departure.id

                return (
                  <button
                    key={departure.id}
                    type="button"
                    disabled={isFull}
                    aria-pressed={isActive}
                    onClick={() => selectDeparture(departure.id)}
                    className={`rounded-xl px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isActive
                        ? 'bg-blue-950 text-white shadow-md'
                        : 'bg-white text-blue-950 ring-1 ring-slate-200 hover:ring-blue-900/40'
                    }`}
                  >
                    <span className="block text-sm font-bold">{formatDepartureTime(departure)}</span>
                    <span className={`block text-[11px] ${isActive ? 'text-yellow-300' : isFull ? 'text-red-600' : 'text-emerald-700'}`}>
                      {isFull
                        ? t('activities.card.sessionFull')
                        : departure.capacity > 0
                          ? t('activities.card.sessionCapacity', { count: departure.capacity })
                          : t('activities.card.sessionOpen')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <SectionLabel
              extra={
                maxGuests > 0 && (
                  <span className={`normal-case tracking-normal ${atLimit ? 'text-red-600' : 'text-slate-400'}`}>
                    {t('activityDetail.booking.maxGuests', { count: maxGuests })}
                  </span>
                )
              }
            >
              {t('activityDetail.booking.guests')}
            </SectionLabel>
            <div className="divide-y divide-slate-100 rounded-2xl px-4 ring-1 ring-slate-200">
              <Stepper
                label={t('activityDetail.booking.adults')}
                hint={t('activityDetail.booking.adultsHint')}
                value={adultCount}
                min={1}
                onChange={(delta) => changeGuests('adult', delta)}
                disableIncrease={atLimit}
              />
              <Stepper
                label={t('activityDetail.booking.children')}
                hint={t('activityDetail.booking.childrenHint')}
                value={childCount}
                min={0}
                onChange={(delta) => changeGuests('child', delta)}
                disableIncrease={atLimit}
              />
            </div>
          </div>

          <label className="block">
            <SectionLabel>{t('activityDetail.booking.pickup')}</SectionLabel>
            <input
              value={pickupLocation}
              onChange={(event) => setPickupLocation(event.target.value)}
              maxLength={pickupMax}
              placeholder={t('activityDetail.booking.pickupPlaceholder')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
            />
          </label>

          {isAuthenticated && (
            <div>
              <SectionLabel>{t('activityDetail.booking.coupon')}</SectionLabel>
              {couponCode && quote?.isCouponApplied ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm ring-1 ring-emerald-100">
                  <span className="font-bold text-emerald-700">
                    {t('activityDetail.booking.couponApplied', { code: couponCode })}
                  </span>
                  <button type="button" onClick={clearCoupon} className="text-xs font-bold text-slate-500 hover:text-red-600">
                    {t('activityDetail.booking.couponRemove')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        applyCoupon()
                      }
                    }}
                    placeholder={t('activityDetail.booking.couponPlaceholder')}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm uppercase text-slate-800 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
                  />
                  <button
                    type="button"
                    disabled={!couponInput.trim()}
                    onClick={applyCoupon}
                    className="rounded-xl bg-slate-100 px-4 text-xs font-bold text-blue-950 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    {t('activityDetail.booking.couponApply')}
                  </button>
                </div>
              )}
              {couponCode && quote && !quote.isCouponApplied && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {quote.couponMessage || t('activityDetail.booking.couponInvalid')}
                </p>
              )}
            </div>
          )}

          {price && (
            <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-4 text-sm">
              <p className="flex justify-between text-slate-600">
                <span>{t('activityDetail.booking.adultLine', { count: adultCount })}</span>
                <span>{formatPrice(price.adultSubtotal)}</span>
              </p>
              {childCount > 0 && (
                <p className="flex justify-between text-slate-600">
                  <span>{t('activityDetail.booking.childLine', { count: childCount })}</span>
                  <span>{formatPrice(price.childSubtotal)}</span>
                </p>
              )}
              {price.discountAmount > 0 && (
                <p className="flex justify-between font-semibold text-emerald-700">
                  <span>{t('activityDetail.booking.discount')}</span>
                  <span>−{formatPrice(price.discountAmount)}</span>
                </p>
              )}
              <p className="flex items-end justify-between gap-3 pt-2">
                <span className="font-bold text-blue-950">
                  {t('activityDetail.booking.total')}
                  {price.isEstimate && (
                    <span className="block text-[11px] font-medium text-slate-400">{t('activityDetail.booking.estimate')}</span>
                  )}
                </span>
                <span className={`whitespace-nowrap text-xl font-extrabold text-blue-950 transition ${quoteLoading ? 'opacity-50' : ''}`}>
                  {formatPrice(price.totalAmount)}
                </span>
              </p>
            </div>
          )}

          {bookingError && <AuthAlert>{bookingError}</AuthAlert>}

          <button
            type="button"
            onClick={startBooking}
            disabled={booking || !selectedDeparture}
            className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-extrabold text-blue-950 shadow-[0_14px_30px_-14px_rgba(253,199,0,0.9)] transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {booking && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {isAuthenticated ? t('activityDetail.booking.submit') : t('activityDetail.booking.loginToBook')}
            {!booking && <Icon name="arrow-right" className="h-4 w-4" strokeWidth={2} />}
          </button>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <Icon name="check-circle" className="h-4 w-4 shrink-0 text-emerald-600" />
              {t('activityDetail.booking.noteHold')}
            </li>
            <li className="flex items-start gap-2">
              <Icon name="credit-card" className="h-4 w-4 shrink-0 text-emerald-600" />
              {t('activityDetail.booking.notePayment')}
            </li>
            <li className="flex items-start gap-2">
              <Icon name="shield-check" className="h-4 w-4 shrink-0 text-emerald-600" />
              {t('activityDetail.booking.noteSafety')}
            </li>
          </ul>
        </div>
      )}
    </aside>
  )
}
