import { getValidImage } from '@/utils/image.js'
import { getResponseList } from '@/utils/response.js'
import { getValidText } from '@/utils/text.js'

/** Trạng thái đăng ký (RegistrationStatus của Backend) */
export const REGISTRATION_STATUS = {
  pendingPayment: 'PENDING_PAYMENT',
  paymentReview: 'PAYMENT_REVIEW',
  waitingForBuddy: 'WAITING_FOR_BUDDY',
  buddyAssigned: 'BUDDY_ASSIGNED',
  confirmed: 'CONFIRMED',
  inProgress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
}

export const CHECK_IN_STATUS = {
  present: 'PRESENT',
  absent: 'ABSENT',
  notYet: 'NOT_YET',
}

export const JOURNEY_FILTER = {
  all: 'ALL',
  upcoming: 'UPCOMING',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
}

// Check-in mở 60 phút trước giờ khởi hành (RegistrationServiceImpl.checkIn)
export const CHECK_IN_OPEN_MINUTES = 60

const toDate = (date, time) => {
  if (!date) return null

  const value = new Date(`${date}T${time || '00:00'}`)

  return Number.isNaN(value.getTime()) ? null : value
}

const toNumber = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

const upper = (value, fallback = '') => String(value ?? fallback).toUpperCase()

/** Mã ngắn để khách đọc khi liên hệ, VD "#3F2A9C1B" */
export const getShortCode = (id) => (id ? `#${String(id).slice(0, 8).toUpperCase()}` : '')

const mapJoinedActivity = (item) => ({
  registrationId: item?.registrationId ?? '',
  activityType: item?.activityType ?? '',
  thumbnailUrl: getValidImage(item?.thumbnailUrl),
  locationName: getValidText(item?.locationName),
  address: getValidText(item?.address),
  buddyAvatar: getValidImage(item?.avatarUrl),
})

export const mapFeedback = (item) => ({
  id: item?.feedbackId ?? '',
  registrationId: item?.registrationId ?? '',
  activityId: item?.activityId ?? '',
  activityTitle: getValidText(item?.activityTitle),
  buddyName: getValidText(item?.buddyName),
  tourRating: toNumber(item?.tripRating),
  tourComment: getValidText(item?.tripComment),
  buddyRating: toNumber(item?.buddyRating),
  buddyComment: getValidText(item?.buddyComment),
  createdAt: item?.createdAt ?? null,
})

export const mapPayment = (item) => ({
  id: item?.id ?? '',
  registrationId: item?.registrationId ?? '',
  invoiceNumber: getValidText(item?.invoiceNumber),
  amount: toNumber(item?.amount),
  currency: item?.currency ?? 'VND',
  status: upper(item?.status ?? item?.paymentStatus, 'PENDING'),
  createdAt: item?.createdAt ?? null,
  paidAt: item?.paidAt ?? null,
})

/**
 * Ghép đăng ký (registrations/me) với ảnh, điểm hẹn (activity/joined) và đánh giá (feedback/me)
 * theo registrationId để có đủ dữ liệu cho một thẻ chuyến đi.
 */
export const buildJourneys = (registrationsResponse, joinedResponse, feedbacks = []) => {
  const joinedById = new Map(
    getResponseList(joinedResponse)
      .map(mapJoinedActivity)
      .map((item) => [item.registrationId, item]),
  )
  const feedbackById = new Map(feedbacks.map((item) => [item.registrationId, item]))

  return getResponseList(registrationsResponse)
    .map((item) => {
      const id = item?.registrationId ?? ''
      const departure = item?.departure ?? {}
      const joined = joinedById.get(id) ?? {}

      return {
        id,
        code: getShortCode(id),
        status: upper(item?.status, REGISTRATION_STATUS.pendingPayment),
        checkInStatus: upper(item?.checkInStatus, CHECK_IN_STATUS.notYet),

        activityId: departure?.activity?.activityId ?? '',
        title: getValidText(departure?.activity?.title),
        activityType: joined.activityType ?? '',
        thumbnailUrl: joined.thumbnailUrl ?? '',
        locationName: joined.locationName ?? '',
        address: joined.address ?? '',

        departureDate: departure?.departureDate ?? '',
        startTime: departure?.startTime ?? '',
        endTime: departure?.endTime ?? '',
        start: toDate(departure?.departureDate, departure?.startTime),
        end: toDate(departure?.departureDate, departure?.endTime || departure?.startTime),

        buddyId: item?.buddy?.buddyId ?? '',
        buddyName: getValidText(item?.buddy?.name),
        buddyRating: toNumber(item?.buddy?.averageRating),
        buddyAvatar: joined.buddyAvatar ?? '',

        adultCount: toNumber(item?.adultCount),
        childCount: toNumber(item?.childCount),
        pickupLocation: getValidText(item?.pickupLocation),
        totalAmount: toNumber(item?.totalAmount),

        registeredAt: item?.registeredAt ?? null,
        paymentExpiresAt: item?.paymentExpiresAt ?? null,
        paymentConfirmedAt: item?.paymentConfirmedAt ?? null,
        checkedInAt: item?.checkedInAt ?? null,
        cancelledAt: item?.cancelledAt ?? null,

        feedback: feedbackById.get(id) ?? null,
      }
    })
    .filter((journey) => journey.id)
}

/** Cập nhật một chuyến đi từ RegistrationResponse mới (sau check-in / huỷ) */
export const mergeRegistration = (journey, response) => {
  const [updated] = buildJourneys({ data: [response?.data?.data ?? response?.data ?? response] })

  if (!updated) return journey

  return {
    ...journey,
    status: updated.status,
    checkInStatus: updated.checkInStatus,
    checkedInAt: updated.checkedInAt,
    cancelledAt: updated.cancelledAt,
  }
}

const isPast = (journey, now) => Boolean(journey.end && journey.end < now)

/** Phân loại chuyến đi: CANCELLED | COMPLETED | UPCOMING */
export const getJourneyGroup = (journey, now = new Date()) => {
  if (journey.status === REGISTRATION_STATUS.cancelled) return JOURNEY_FILTER.cancelled
  if (journey.status === REGISTRATION_STATUS.completed) return JOURNEY_FILTER.completed

  // Đã qua giờ kết thúc mà chưa bị huỷ: coi như đã đi nếu đã check-in hoặc tour đã chạy
  if (
    isPast(journey, now) &&
    (journey.checkInStatus === CHECK_IN_STATUS.present ||
      [REGISTRATION_STATUS.buddyAssigned, REGISTRATION_STATUS.confirmed, REGISTRATION_STATUS.inProgress].includes(journey.status))
  ) {
    return JOURNEY_FILTER.completed
  }

  return JOURNEY_FILTER.upcoming
}

/** Chuyến đã đi, có Buddy, chưa đánh giá */
export const canReview = (journey, now = new Date()) =>
  !journey.feedback &&
  Boolean(journey.buddyId) &&
  getJourneyGroup(journey, now) === JOURNEY_FILTER.completed

/**
 * Trạng thái nút check-in:
 * 'DONE' đã check-in | 'OPEN' bấm được | 'NOT_OPEN' chưa tới giờ | 'UNAVAILABLE' không áp dụng
 */
export const getCheckInState = (journey, now = new Date()) => {
  if (journey.checkInStatus === CHECK_IN_STATUS.present) return 'DONE'

  if (
    journey.status !== REGISTRATION_STATUS.buddyAssigned ||
    !journey.paymentConfirmedAt ||
    !journey.start ||
    isPast(journey, now)
  ) {
    return 'UNAVAILABLE'
  }

  const opensAt = new Date(journey.start.getTime() - CHECK_IN_OPEN_MINUTES * 60 * 1000)

  return now >= opensAt ? 'OPEN' : 'NOT_OPEN'
}

/** Huỷ được khi chưa khởi hành, chưa check-in và chưa thanh toán */
export const canCancel = (journey, now = new Date()) =>
  ![REGISTRATION_STATUS.cancelled, REGISTRATION_STATUS.completed].includes(journey.status) &&
  journey.checkInStatus !== CHECK_IN_STATUS.present &&
  !journey.paymentConfirmedAt &&
  Boolean(journey.start) &&
  journey.start > now

/** Sắp xếp: sắp tới (gần nhất trước), rồi đã đi / đã huỷ (mới nhất trước) */
export const sortJourneys = (journeys, now = new Date()) => {
  const upcoming = journeys
    .filter((journey) => getJourneyGroup(journey, now) === JOURNEY_FILTER.upcoming)
    .sort((a, b) => (a.start?.getTime() ?? Infinity) - (b.start?.getTime() ?? Infinity))
  const others = journeys
    .filter((journey) => getJourneyGroup(journey, now) !== JOURNEY_FILTER.upcoming)
    .sort((a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0))

  return [...upcoming, ...others]
}

/** Thống kê cho thẻ hồ sơ */
export const getJourneyStats = (journeys, feedbacks, now = new Date()) => {
  const count = (group) => journeys.filter((journey) => getJourneyGroup(journey, now) === group).length

  return {
    completed: count(JOURNEY_FILTER.completed),
    upcoming: count(JOURNEY_FILTER.upcoming),
    reviews: feedbacks.length,
    buddies: [
      ...new Set(
        journeys
          .filter((journey) => journey.status !== REGISTRATION_STATUS.cancelled)
          .map((journey) => journey.buddyName)
          .filter(Boolean),
      ),
    ],
  }
}
