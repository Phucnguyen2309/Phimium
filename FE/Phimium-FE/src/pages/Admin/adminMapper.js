import { getValidImage } from '@/utils/image.js'
import { getResponseData, getResponseList, safeList } from '@/utils/response.js'
import { getValidText } from '@/utils/text.js'
import { t } from '@/utils/i18n.js'

export const mapDashboardStats = (response) => {
  const data = getResponseData(response) || {}
  return {
    totalUsers: Number(data.totalUsers ?? 0),
    totalBuddies: Number(data.activeBuddies ?? data.totalBuddies ?? 0),
    totalActivities: Number(data.totalActivities ?? 0),
    totalBookings: Number(data.totalBookings ?? 0),
    totalRevenue: Number(data.totalRevenue ?? 0),
    pendingPayments: Number(data.pendingPayments ?? 0),
    waitingForBuddyCount: Number(data.waitingForBuddyCount ?? 0),
    recentRegistrations: safeList(data.recentRegistrations)
      .map(mapAdminBooking)
      .filter(Boolean),
  }
}

// ActivityResponse: id, title, description, activityType, thumbnailUrl, locationName, address,
//   participationFee, childParticipationFee, minimumParticipants, maximumParticipants,
//   groupMinSize, groupMaxSize, longitude, latitude, status, createdById, createdAt, updatedAt, departures[]
export const mapAdminActivity = (item) => {
  if (!item) return null

  const title = getValidText(
    item?.title ?? item?.activityTitle ?? item?.activity?.title,
    t('admin.common.untitled'),
  )

  // activityType là TourType enum từ BE (không phải category)
  const activityType = item?.activityType ?? item?.tourType ?? ''

  const locationName = getValidText(
    item?.locationName ?? item?.address,
    '',
  )

  const price = Number(item?.participationFee ?? item?.price ?? 0)
  const minParticipants = Number(item?.minimumParticipants ?? item?.groupMinSize ?? 1)
  const maxParticipants = Number(item?.maximumParticipants ?? item?.groupMaxSize ?? 0)
  const status = item?.status || 'PUBLISHED'

  // Giữ lại departures[] từ ActivityResponse (ActivityDepartureResponse[]) hoặc AdminDepartureResponse
  // Fields: departureId, activityId, departureDate, startTime, endTime, capacity, status, totalCapacity, remainingSeats, reservedGuests
  const departures = Array.isArray(item?.departures)
    ? item.departures.map((d) => ({
        departureId: d?.departureId ?? '',
        departureDate: d?.departureDate ?? '',
        startTime: d?.startTime ? String(d.startTime).slice(0, 5) : '',
        endTime: d?.endTime ? String(d.endTime).slice(0, 5) : '',
        capacity: Number(d?.capacity ?? 0),
        totalCapacity: Number(d?.totalCapacity ?? (d?.capacity != null && d?.reservedGuests != null ? d.capacity + d.reservedGuests : d?.capacity ?? 0)),
        remainingSeats: Number(d?.remainingSeats ?? d?.capacity ?? 0),
        reservedGuests: Number(d?.reservedGuests ?? 0),
        status: d?.status ?? '',
      }))
    : []

  return {
    id: item?.id ?? item?.activityId ?? '',
    title,
    description: item?.description ?? '',
    activityType,
    locationName,
    address: item?.address ?? '',
    thumbnailUrl: getValidImage(item?.thumbnailUrl),
    price,
    participationFee: Number(item?.participationFee ?? price),
    childParticipationFee: Number(item?.childParticipationFee ?? 0),
    minParticipants,
    maxParticipants,
    minimumParticipants: minParticipants,
    maximumParticipants: maxParticipants,
    groupMinSize: Number(item?.groupMinSize ?? 2),
    groupMaxSize: Number(item?.groupMaxSize ?? 4),
    longitude: item?.longitude ?? null,
    latitude: item?.latitude ?? null,
    status,
    departures,
    createdAt: item?.createdAt ?? '',
    updatedAt: item?.updatedAt ?? '',
  }
}


export const mapAdminActivitiesResponse = (response) =>
  getResponseList(response).map(mapAdminActivity).filter(Boolean)

// AdminRegistrationResponse: { booking: RegistrationResponse, customer: { userId, fullName, email, phone } }
// RegistrationResponse: registrationId, status, departure{departureId, departureDate, startTime, endTime, activity{activityId, title}},
//   adultCount, childCount, pickupLocation, subtotal, discountAmount, totalAmount,
//   buddy{buddyId, name, averageRating}, checkInStatus, registeredAt, paymentExpiresAt, paymentConfirmedAt, checkedInAt, cancelledAt
export const mapAdminBooking = (item) => {
  if (!item) return null

  // Hỗ trợ cả AdminRegistrationResponse { booking, customer } và RegistrationResponse trực tiếp
  const booking = item?.booking ?? item
  const customer = item?.customer ?? null

  const rawId = String(booking?.registrationId ?? booking?.id ?? item?.id ?? '')
  const lastPart = rawId ? rawId.split('-').pop() : ''
  const fallbackCode = lastPart ? `#BK-${lastPart.slice(-6).toUpperCase()}` : (rawId ? `#BK-${rawId.slice(0, 8).toUpperCase()}` : '#BK-ORDER')
  const invoiceNumber = getValidText(
    booking?.invoiceNumber ?? booking?.invoiceCode ?? item?.invoiceNumber ?? item?.invoiceCode,
    fallbackCode,
  )
  const invoiceCode = invoiceNumber

  const customerName =
    customer?.fullName ||
    (customer?.email ? customer.email.split('@')[0] : t('admin.common.guest'))

  const customerEmail = customer?.email || ''
  const customerPhone = customer?.phone || ''

  const activityTitle =
    booking?.departure?.activity?.title ||
    t('admin.common.untitled')

  const departureDate = booking?.departure?.departureDate || ''
  const startTime = booking?.departure?.startTime
    ? String(booking.departure.startTime).slice(0, 5)
    : ''

  const adultCount = Number(booking?.adultCount ?? 0)
  const childCount = Number(booking?.childCount ?? 0)
  const ticketCount = adultCount + childCount || 1

  const totalAmount = Number(booking?.totalAmount ?? 0)
  const status = booking?.status || 'PENDING_PAYMENT'
  const createdAt = booking?.registeredAt || ''

  // buddy từ RegistrationResponse.BuddyInfo { buddyId, name, averageRating }
  const buddyName = booking?.buddy?.name || ''
  const buddyId = booking?.buddy?.buddyId || ''

  return {
    id: rawId,
    invoiceCode,
    invoiceNumber,
    customerName,
    customerEmail,
    customerPhone,
    activityTitle,
    departureDate,
    startTime,
    adultCount,
    childCount,
    ticketCount,
    totalAmount,
    status,
    createdAt,
    buddyName,
    buddyId,
    pickupLocation: booking?.pickupLocation || '',
    checkInStatus: booking?.checkInStatus || null,
  }
}

export const mapAdminBookingsResponse = (response) =>
  getResponseList(response).map(mapAdminBooking)

// BuddyResponse: buddyId, userId, fullName, bio, experience, introduction, avatarUrl, averageRating, totalReviews
// NOTE: BuddyMapper.toResponse() trong BE KHÔNG map status field → item.status luôn undefined
// BuddyStatus: ACTIVE | INACTIVE | SUSPENDED
export const mapAdminBuddy = (item) => ({
  id: item?.buddyId ?? item?.id ?? '',
  userId: item?.userId ?? '',
  fullName: getValidText(item?.fullName, t('admin.common.unnamed')),
  bio: getValidText(item?.bio, ''),
  experience: getValidText(item?.experience, ''),
  introduction: getValidText(item?.introduction, ''),
  avatarUrl: getValidImage(item?.avatarUrl),
  averageRating: Number(item?.averageRating ?? 0),
  totalReviews: Number(item?.totalReviews ?? 0),
  // BuddyStatus: ACTIVE | INACTIVE | SUSPENDED
  status: item?.status ? String(item.status).toUpperCase() : 'ACTIVE',
})


export const mapAdminBuddiesResponse = (response) =>
  getResponseList(response).map(mapAdminBuddy)

export const mapAdminUser = (item) => ({
  id: item?.userId ?? item?.id ?? '',
  fullName: getValidText(item?.fullName, t('admin.common.unnamed')),
  email: getValidText(item?.email, ''),
  phone: getValidText(item?.phone, ''),
  avatarUrl: getValidImage(item?.avatarUrl),
  role: item?.role ?? 'USER',
  status: item?.status ?? 'ACTIVE',
  createdAt: item?.createdAt ?? '',
})

export const mapAdminUsersResponse = (response) =>
  getResponseList(response).map(mapAdminUser)

// Coupon entity: couponId, code, name, description, discountType, discountValue,
//   minimumOrderAmount, maximumDiscountAmount, validFrom, validUntil, usageLimit, usedCount, status, createdAt, updatedAt
export const mapAdminCoupon = (item) => ({
  id: item?.couponId ?? item?.id ?? '',
  code: getValidText(item?.code, ''),
  name: getValidText(item?.name, ''),
  description: getValidText(item?.description, ''),
  discountType: item?.discountType ?? 'PERCENTAGE',
  discountValue: Number(item?.discountValue ?? 0),
  minimumOrderAmount: Number(item?.minimumOrderAmount ?? 0),
  maximumDiscountAmount: Number(item?.maximumDiscountAmount ?? 0),
  usageLimit: Number(item?.usageLimit ?? 0),
  usedCount: Number(item?.usedCount ?? 0),
  validFrom: item?.validFrom ?? '',
  validUntil: item?.validUntil ?? '',
  status: item?.status ?? 'ACTIVE',
  createdAt: item?.createdAt ?? '',
})

export const mapAdminCouponsResponse = (response) =>
  getResponseList(response).map(mapAdminCoupon)

export const mapAdminPayment = (item) => {
  const invoiceNum = getValidText(
    item?.invoiceNumber ?? item?.invoiceCode ?? item?.transactionCode,
    item?.id ? `INV-${String(item.id).replace(/-/g, '').slice(0, 8).toUpperCase()}` : '—',
  )

  const customerName = getValidText(
    item?.customerName ??
      item?.userName ??
      item?.customer?.fullName ??
      item?.user?.fullName ??
      item?.fullName,
    '—',
  )

  return {
    id: item?.paymentId ?? item?.id ?? '',
    invoiceCode: invoiceNum,
    invoiceNumber: invoiceNum,
    registrationId: item?.registrationId ?? '',
    amount: Number(item?.amount ?? 0),
    paymentMethod: item?.paymentMethod ?? item?.provider ?? 'SEPAY',
    status: item?.status ?? 'PENDING',
    paidAt: item?.paidAt ?? item?.createdAt ?? '',
    createdAt: item?.createdAt ?? '',
    userName: customerName,
  }
}

export const mapAdminPaymentsResponse = (response) =>
  getResponseList(response).map(mapAdminPayment)

// FeedBackResponse: feedbackId, reviewerId, reviewerName, buddyId, buddyName,
//   registrationId, activityId, activityTitle, tripRating, tripComment, buddyRating, buddyComment, createdAt
export const mapAdminFeedback = (item) => {
  if (!item) return null
  const reviewerName = getValidText(
    item?.reviewerName ?? item?.customerName ?? item?.userName,
    t('admin.common.guest'),
  )

  const tripRating = Number(item?.tripRating ?? item?.tourRating ?? item?.rating ?? 0)
  const buddyRating = Number(item?.buddyRating ?? 0)

  return {
    id: item?.feedbackId ?? item?.id ?? '',
    reviewerId: item?.reviewerId ?? '',
    reviewerName,
    activityId: item?.activityId ?? '',
    activityTitle: getValidText(item?.activityTitle ?? item?.tourTitle, t('admin.common.untitled')),
    buddyId: item?.buddyId ?? '',
    buddyName: getValidText(item?.buddyName, ''),
    registrationId: item?.registrationId ?? '',
    tripRating,
    tripComment: getValidText(item?.tripComment ?? item?.tourComment ?? item?.comment ?? item?.content, ''),
    buddyRating,
    buddyComment: getValidText(item?.buddyComment, ''),
    createdAt: item?.createdAt ?? '',
  }
}

export const mapAdminFeedbacksResponse = (response) =>
  getResponseList(response).map(mapAdminFeedback)