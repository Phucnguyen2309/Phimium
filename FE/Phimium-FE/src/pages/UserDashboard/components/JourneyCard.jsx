import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Icon, RatingStars } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatActivityType, formatDepartureTime } from '@/features/activity/activityMapper.js'
import {
  CHECK_IN_OPEN_MINUTES,
  canCancel,
  canReview,
  getCheckInState,
  getJourneyGroup,
  JOURNEY_FILTER,
  REGISTRATION_STATUS,
} from '@/pages/UserDashboard/userDashboardMapper.js'
import { buildActivityDetailPath } from '@/routes/paths.js'
import { formatDate, formatDateTime, formatMoney } from '@/utils/format.js'
import { getLocale } from '@/utils/i18n.js'
import { getInitials } from '@/utils/text.js'

const GROUP_BADGES = {
  [JOURNEY_FILTER.upcoming]: 'bg-yellow-400 text-blue-950',
  [JOURNEY_FILTER.completed]: 'bg-white/95 text-blue-950',
  [JOURNEY_FILTER.cancelled]: 'bg-slate-800/90 text-white',
}

// Màu chip trạng thái đăng ký ở góc phải
const STATUS_TONES = {
  [REGISTRATION_STATUS.pendingPayment]: 'bg-amber-50 text-amber-700 ring-amber-200',
  [REGISTRATION_STATUS.paymentReview]: 'bg-amber-50 text-amber-700 ring-amber-200',
  [REGISTRATION_STATUS.waitingForBuddy]: 'bg-blue-50 text-blue-800 ring-blue-200',
  [REGISTRATION_STATUS.buddyAssigned]: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  [REGISTRATION_STATUS.confirmed]: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  [REGISTRATION_STATUS.inProgress]: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  [REGISTRATION_STATUS.completed]: 'bg-slate-100 text-slate-600 ring-slate-200',
  [REGISTRATION_STATUS.cancelled]: 'bg-red-50 text-red-600 ring-red-200',
}

const formatRelativeDay = (date, t) => {
  if (!date) return ''

  const today = new Date()
  const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const diff = Math.round((startOfDay(date) - startOfDay(today)) / 86400000)

  if (diff === 0) return t('userDashboard.journey.today')
  if (diff === 1) return t('userDashboard.journey.tomorrow')

  return date.toLocaleDateString(getLocale(), { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function JourneyImage({ journey, group, t }) {
  const [hasError, setHasError] = useState(false)
  const guests = journey.adultCount + journey.childCount

  const badge =
    group === JOURNEY_FILTER.upcoming
      ? t('userDashboard.journey.badgeUpcoming', { day: formatRelativeDay(journey.start, t) })
      : group === JOURNEY_FILTER.completed
        ? t('userDashboard.journey.badgeCompleted', { date: formatDate(journey.start) })
        : t('userDashboard.journey.badgeCancelled')

  return (
    <div className="relative min-h-52 overflow-hidden bg-blue-950 sm:min-h-full">
      {journey.thumbnailUrl && !hasError ? (
        <img
          src={journey.thumbnailUrl}
          alt={journey.title}
          loading="lazy"
          onError={() => setHasError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
            group === JOURNEY_FILTER.cancelled ? 'grayscale' : ''
          }`}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 font-display text-4xl font-bold text-yellow-400/90">
          {getInitials(journey.title, 'P')}
        </span>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-blue-950/50 via-transparent to-transparent" />

      <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${GROUP_BADGES[group]}`}>
        {group === JOURNEY_FILTER.upcoming && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-950" />}
        {badge}
      </span>

      {guests > 0 && (
        <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-blue-950 shadow-sm">
          {journey.childCount > 0
            ? t('userDashboard.journey.guestsWithChildren', { adults: journey.adultCount, children: journey.childCount })
            : t('userDashboard.journey.guests', { count: journey.adultCount })}
        </span>
      )}
    </div>
  )
}

function Meta({ icon, children }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-slate-600">
      <Icon name={icon} className="h-4 w-4 shrink-0 text-blue-900" />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  )
}

function UpcomingFooter({ journey, pendingAction, onCheckIn, onCancel, onPay, t }) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const checkInState = getCheckInState(journey)
  const cancellable = canCancel(journey)

  let note = null
  if (journey.status === REGISTRATION_STATUS.pendingPayment && journey.paymentExpiresAt) {
    note = { icon: 'credit-card', tone: 'text-amber-700', text: t('userDashboard.journey.payBefore', { time: formatDateTime(journey.paymentExpiresAt) }) }
  } else if (journey.status === REGISTRATION_STATUS.paymentReview) {
    note = { icon: 'credit-card', tone: 'text-amber-700', text: t('userDashboard.journey.paymentReview') }
  } else if (journey.status === REGISTRATION_STATUS.waitingForBuddy) {
    note = { icon: 'user', tone: 'text-blue-800', text: t('userDashboard.journey.waitingBuddy') }
  } else if (checkInState === 'NOT_OPEN') {
    note = { icon: 'clock', tone: 'text-emerald-700', text: t('userDashboard.journey.checkInOpens', { minutes: CHECK_IN_OPEN_MINUTES }) }
  } else if (checkInState === 'DONE') {
    note = { icon: 'check-circle', tone: 'text-emerald-700', text: t('userDashboard.journey.checkedIn') }
  }

  return (
    <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      {note ? (
        <p className={`flex items-center gap-1.5 text-xs font-semibold ${note.tone}`}>
          <Icon name={note.icon} className="h-4 w-4 shrink-0" />
          {note.text}
        </p>
      ) : (
        <span />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {cancellable &&
          (confirmCancel ? (
            <span className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-100">
              {t('userDashboard.journey.cancelConfirm')}
              <button
                type="button"
                disabled={Boolean(pendingAction)}
                onClick={() => onCancel(journey)}
                className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {pendingAction === 'cancel' ? t('common.processing') : t('userDashboard.journey.cancelYes')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                className="rounded-lg px-2 py-1 font-bold text-slate-600 transition hover:bg-white"
              >
                {t('userDashboard.journey.cancelNo')}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="x-circle" className="h-4 w-4" />
              {t('userDashboard.journey.cancel')}
            </button>
          ))}

        {journey.status === REGISTRATION_STATUS.pendingPayment && journey.totalAmount > 0 && (
          <button
            type="button"
            disabled={Boolean(pendingAction)}
            onClick={() => onPay(journey)}
            className="shine inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-xs font-extrabold text-blue-950 shadow-sm transition hover:bg-yellow-300 disabled:opacity-60"
          >
            <Icon name="credit-card" className="h-4 w-4" />
            {pendingAction === 'pay' ? t('common.processing') : t('userDashboard.journey.payNow')}
          </button>
        )}

        {(checkInState === 'OPEN' || checkInState === 'NOT_OPEN') && (
          <button
            type="button"
            disabled={checkInState !== 'OPEN' || Boolean(pendingAction)}
            onClick={() => onCheckIn(journey)}
            className="shine inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-xs font-extrabold text-blue-950 shadow-sm transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            <Icon name="ticket" className="h-4 w-4" />
            {pendingAction === 'checkIn' ? t('common.processing') : t('userDashboard.journey.checkIn')}
          </button>
        )}
      </div>
    </div>
  )
}

function ReviewBlock({ journey, t }) {
  const { feedback } = journey

  return (
    <div className="mt-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-blue-950">{t('userDashboard.journey.yourReview')}</p>
        {feedback.createdAt && (
          <p className="text-[11px] font-semibold text-slate-500">
            {t('userDashboard.journey.reviewedOn', { date: formatDate(feedback.createdAt) })}
          </p>
        )}
      </div>
      {feedback.tourComment && (
        <p className="mt-2 text-sm italic leading-6 text-slate-700">“{feedback.tourComment}”</p>
      )}
      {feedback.buddyRating > 0 && (
        <div className="mt-3 flex flex-wrap items-start gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100">
          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            {t('userDashboard.journey.buddyReview', { name: feedback.buddyName || journey.buddyName })}
            <RatingStars value={feedback.buddyRating} size="h-3.5 w-3.5" />
          </span>
          {feedback.buddyComment && (
            <span className="w-full text-[13px] leading-5 text-slate-600">“{feedback.buddyComment}”</span>
          )}
        </div>
      )}
    </div>
  )
}

export function JourneyCard({ journey, pendingAction, onCheckIn, onCancel, onPay, onReview }) {
  const { t } = useLanguage()

  const group = getJourneyGroup(journey)
  const needsReview = canReview(journey)
  const detailPath = journey.activityId ? buildActivityDetailPath(journey.activityId) : null
  const meetingPoint = journey.pickupLocation || journey.locationName || journey.address
  const eyebrow = [journey.locationName, journey.activityType && formatActivityType(journey.activityType)]
    .filter(Boolean)
    .join(' · ')
  const time = formatDepartureTime(journey)

  return (
    <article
      className={`group grid overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_20px_50px_-38px_rgba(22,36,86,0.5)] transition duration-500 hover:shadow-[0_28px_60px_-34px_rgba(22,36,86,0.5)] sm:grid-cols-[15rem_1fr] lg:grid-cols-[17rem_1fr] ${
        group === JOURNEY_FILTER.cancelled ? 'opacity-80' : ''
      }`}
    >
      <JourneyImage journey={journey} group={group} t={t} />

      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {eyebrow || t('userDashboard.journey.bookedOn', { date: formatDate(journey.registeredAt) })}
          </p>

          {journey.feedback ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-950">
              <RatingStars value={journey.feedback.tourRating} size="h-4 w-4" />
              {journey.feedback.tourRating.toFixed(1)}
            </span>
          ) : needsReview ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-0.5 text-[11px] font-bold text-yellow-800 ring-1 ring-yellow-200">
              <Icon name="pencil-square" className="h-3.5 w-3.5" />
              {t('userDashboard.journey.needsReview')}
            </span>
          ) : (
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ${STATUS_TONES[journey.status] ?? STATUS_TONES.COMPLETED}`}>
              {t(`userDashboard.status.${journey.status}`)} {journey.code}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 text-lg font-extrabold leading-snug tracking-tight text-blue-950 sm:text-xl">
          {detailPath ? (
            <Link to={detailPath} className="transition hover:text-blue-700">
              {journey.title || t('activity.untitled')}
            </Link>
          ) : (
            journey.title || t('activity.untitled')
          )}
        </h3>

        <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
          <Meta icon="calendar">
            {formatRelativeDay(journey.start, t)}
            {time && `, ${time}`}
          </Meta>
          {meetingPoint && <Meta icon="map-pin">{t('userDashboard.journey.meeting', { place: meetingPoint })}</Meta>}
          <Meta icon="user">
            {journey.buddyName
              ? t('userDashboard.journey.buddy', { name: journey.buddyName })
              : t('userDashboard.journey.noBuddy')}
          </Meta>
        </div>

        {group === JOURNEY_FILTER.upcoming && (
          <UpcomingFooter journey={journey} pendingAction={pendingAction} onCheckIn={onCheckIn} onCancel={onCancel} onPay={onPay} t={t} />
        )}

        {group === JOURNEY_FILTER.completed && needsReview && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-slate-700">
              {t('userDashboard.journey.reviewPrompt', { name: journey.buddyName })}
            </p>
            <button
              type="button"
              onClick={() => onReview(journey)}
              className="shrink-0 rounded-xl bg-blue-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-900"
            >
              {t('userDashboard.journey.reviewNow')}
            </button>
          </div>
        )}

        {journey.feedback && <ReviewBlock journey={journey} t={t} />}

        {group === JOURNEY_FILTER.cancelled && journey.cancelledAt && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Icon name="x-circle" className="h-4 w-4" />
            {t('userDashboard.journey.cancelledOn', { date: formatDateTime(journey.cancelledAt) })}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
            <Icon name="banknotes" className="h-4 w-4" />
            {t('userDashboard.journey.total', { amount: formatMoney(journey.totalAmount) })}
          </span>
          {group !== JOURNEY_FILTER.upcoming && detailPath && (
            <Link
              to={detailPath}
              className="inline-flex items-center gap-1 font-bold text-blue-900 transition hover:text-blue-700"
            >
              {t('userDashboard.journey.bookAgain')}
              <Icon name="arrow-right" className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
