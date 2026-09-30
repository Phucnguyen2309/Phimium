import { ACTIVITY_STATUS } from '@/constants/activity.js'
import { formatEnumLabel, formatMoney } from '@/utils/format.js'
import { getLocale, t } from '@/utils/i18n.js'
import { getResponseList } from '@/utils/response.js'

export { formatDateTime } from '@/utils/format.js'
export { getValidImage } from '@/utils/image.js'

/** Tên loại tour đã dịch (FOODTOUR, HISTORYTOUR), loại lạ thì định dạng từ enum. */
export const formatActivityType = (type) => {
  if (!type) return t('activity.defaultType')

  const key = `activity.types.${String(type).toUpperCase()}`
  const label = t(key)

  return label === key ? formatEnumLabel(type, t('activity.defaultType')) : label
}

/** Label trạng thái theo ngôn ngữ hiện tại (locales: activityStatus.*) */
export const formatStatus = (status) => {
  if (!status) return t(`activityStatus.${ACTIVITY_STATUS.PUBLISHED}`)

  const key = String(status).toUpperCase()

  return ACTIVITY_STATUS[key]
    ? t(`activityStatus.${key}`)
    : formatEnumLabel(status)
}

export const formatPrice = formatMoney

export const getRemainingSlots = (activity) => {
  const maximumParticipants = Number(activity?.maximumParticipants ?? 0)

  const currentParticipants = Number(
    activity?.currentParticipants ??
      activity?.joinedParticipants ??
      activity?.participantCount ??
      activity?.registeredCount ??
      0,
  )

  return Math.max(maximumParticipants - currentParticipants, 0)
}

/** Lịch khởi hành (ActivityDepartureResponse) */
export const DEPARTURE_STATUS = {
  available: 'AVAILABLE',
  full: 'FULL',
  closed: 'CLOSED',
  cancelled: 'CANCELLED',
}

const mapDepartures = (departures) =>
  (Array.isArray(departures) ? departures : [])
    .map((departure) => ({
      id: departure?.departureId ?? '',
      date: departure?.departureDate ?? '',
      startTime: departure?.startTime ?? '',
      endTime: departure?.endTime ?? '',
      capacity: Number(departure?.capacity ?? 0),
      status: String(departure?.status ?? DEPARTURE_STATUS.available).toUpperCase(),
    }))
    .filter((departure) => departure.id && departure.date)

const toMinutes = (time) => {
  const [hours, minutes] = String(time ?? '').split(':').map(Number)

  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null
}

/** Ngày giờ bắt đầu của một lịch khởi hành (giờ địa phương). */
export const getDepartureStart = (departure) => {
  const date = new Date(`${departure.date}T${departure.startTime || '00:00'}`)

  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Lịch khởi hành sắp tới, sắp xếp theo thời gian.
 * Bỏ lịch đã qua, đã đóng hoặc đã huỷ. Lịch FULL vẫn giữ để hiện "Hết chỗ".
 */
export const getUpcomingDepartures = (activity, now = new Date()) =>
  (activity?.departures ?? [])
    .filter(
      (departure) =>
        departure.status !== DEPARTURE_STATUS.closed &&
        departure.status !== DEPARTURE_STATUS.cancelled,
    )
    .map((departure) => ({ ...departure, start: getDepartureStart(departure) }))
    .filter((departure) => departure.start && departure.start >= now)
    .sort((a, b) => a.start - b.start)

/** Thời lượng tour (phút) lấy từ giờ bắt đầu / kết thúc của lịch khởi hành. */
export const getDurationMinutes = (activity) => {
  const departure = (activity?.departures ?? []).find(
    (item) => toMinutes(item.startTime) !== null && toMinutes(item.endTime) !== null,
  )
  if (!departure) return null

  const duration = toMinutes(departure.endTime) - toMinutes(departure.startTime)

  return duration > 0 ? duration : null
}

/** "T7, 12/10" / "Sat, 10/12" */
export const formatDepartureDate = (start) =>
  start
    ? start.toLocaleDateString(getLocale(), { weekday: 'short', day: '2-digit', month: '2-digit' })
    : ''

/** "09:00 – 12:30" từ chuỗi giờ của Backend ("09:00:00") */
export const formatDepartureTime = (departure) =>
  [departure?.startTime, departure?.endTime]
    .filter(Boolean)
    .map((time) => String(time).slice(0, 5))
    .join(' – ')

/** "3 giờ 30 phút" / "3h 30m" */
export const formatDuration = (minutes) => {
  if (!minutes) return ''

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (!hours) return t('activity.duration.minutes', { minutes: rest })
  if (!rest) return t('activity.duration.hours', { hours })

  return t('activity.duration.hoursMinutes', { hours, minutes: rest })
}

export const mapActivity = (activity) => ({
  id: activity?.id ?? '',
  title: activity?.title ?? t('activity.untitled'),
  description: activity?.description ?? '',
  activityType: activity?.activityType ?? 'ACTIVITY',
  status: activity?.status ?? null,
  thumbnailUrl: activity?.thumbnailUrl ?? '',
  startTime: activity?.startTime ?? null,
  endTime: activity?.endTime ?? null,
  registrationDeadline: activity?.registrationDeadline ?? null,
  locationName: activity?.locationName ?? '',
  address: activity?.address ?? '',
  participationFee: activity?.participationFee ?? 0,
  minimumParticipants: activity?.minimumParticipants ?? 0,
  maximumParticipants: activity?.maximumParticipants ?? 0,
  currentParticipants: activity?.currentParticipants ?? null,
  groupMinSize: activity?.groupMinSize ?? 0,
  groupMaxSize: activity?.groupMaxSize ?? 0,
  longitude: activity?.longitude ?? null,
  latitude: activity?.latitude ?? null,
  childParticipationFee: activity?.childParticipationFee ?? null,
  departures: mapDepartures(activity?.departures),
  hostBuddyId: activity?.hostBuddyId ?? null,
  hostBuddyName: activity?.hostBuddyName ?? t('activity.unknownBuddy'),
  createdById: activity?.createdById ?? null,
  createdAt: activity?.createdAt ?? null,
  updatedAt: activity?.updatedAt ?? null,
})

export const mapActivitiesResponse = (response) =>
  getResponseList(response).map(mapActivity)
