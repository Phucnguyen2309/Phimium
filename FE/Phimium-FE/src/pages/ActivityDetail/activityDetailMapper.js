import { getUpcomingDepartures, mapActivity } from '@/features/activity/activityMapper.js'
import { getValidImage } from '@/utils/image.js'
import { getResponseData, getResponseList } from '@/utils/response.js'
import { getValidText } from '@/utils/text.js'

const toNumber = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

/**
 * Ghép chi tiết tour (GET /activity/{id}: Buddy, đánh giá, giới thiệu)
 * với bản ghi trong danh sách (GET /activity/getAll: lịch khởi hành, loại tour, giá trẻ em, cỡ nhóm).
 */
export const buildActivityDetail = (id, detailResponse, listResponse, fromState) => {
  const detail = getResponseData(detailResponse) ?? {}
  const listItem =
    getResponseList(listResponse).find((item) => String(item?.id) === String(id)) ?? fromState ?? null
  const base = mapActivity({ ...(listItem ?? {}), ...detail, id })

  return {
    ...base,
    // Giữ lịch khởi hành / cỡ nhóm từ danh sách vì API chi tiết không trả về
    departures: listItem ? mapActivity(listItem).departures : base.departures,
    groupMinSize: toNumber(listItem?.groupMinSize ?? detail?.groupMinSize),
    groupMaxSize: toNumber(listItem?.groupMaxSize ?? detail?.groupMaxSize),
    childParticipationFee: listItem?.childParticipationFee ?? null,
    // Ảnh tour lấy từ imageUrls của API chi tiết (không dùng thumbnail ở trang này)
    images: [...new Set((Array.isArray(detail?.imageUrls) ? detail.imageUrls : []).map(getValidImage).filter(Boolean))],
  }
}

/** Gom lịch khởi hành sắp tới theo ngày: [{ date, label, departures: [...] }] */
export const groupDeparturesByDate = (activity, now = new Date()) => {
  const groups = new Map()

  getUpcomingDepartures(activity, now).forEach((departure) => {
    const list = groups.get(departure.date) ?? []
    list.push(departure)
    groups.set(departure.date, list)
  })

  return [...groups.entries()].map(([date, departures]) => ({ date, start: departures[0].start, departures }))
}

/** Sức chứa một nhóm (giới hạn số khách khi đặt) */
export const getGroupLimit = (activity) =>
  toNumber(activity?.groupMaxSize) || toNumber(activity?.maximumParticipants) || 0

/** Tạm tính khi chưa có báo giá từ Backend (chưa đăng nhập) */
export const estimatePrice = (activity, adultCount, childCount) => {
  const adultPrice = toNumber(activity?.participationFee)
  const childPrice =
    activity?.childParticipationFee === null || activity?.childParticipationFee === undefined
      ? adultPrice
      : toNumber(activity.childParticipationFee)

  const adultSubtotal = adultPrice * adultCount
  const childSubtotal = childPrice * childCount

  return {
    adultSubtotal,
    childSubtotal,
    subtotal: adultSubtotal + childSubtotal,
    discountAmount: 0,
    totalAmount: adultSubtotal + childSubtotal,
    isEstimate: true,
  }
}

export const mapQuote = (response) => {
  const quote = getResponseData(response) ?? {}

  return {
    adultSubtotal: toNumber(quote.adultSubtotal),
    childSubtotal: toNumber(quote.childSubtotal),
    subtotal: toNumber(quote.subtotal),
    discountAmount: toNumber(quote.discountAmount),
    totalAmount: toNumber(quote.totalAmount),
    couponCode: quote.couponCode ?? '',
    isCouponApplied: Boolean(quote.isCouponApplied),
    couponMessage: getValidText(quote.couponMessage),
    isEstimate: false,
  }
}
