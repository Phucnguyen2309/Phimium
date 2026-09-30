import { getLocale, t } from '@/utils/i18n.js'

const pendingText = () => t('common.comingSoon')

const toValidDate = (value) => {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** 450000 -> "450.000 VND" (vi) / "450,000 VND" (en), 0 -> "Miễn phí" / "Free" */
export const formatMoney = (value) => {
  const amount = Number(value ?? 0)

  if (!amount || amount <= 0) return t('common.free')

  return `${amount.toLocaleString(getLocale())} VND`
}

/** Ngày + giờ, VD: "10 thg 7, 2026 09:00" */
export const formatDateTime = (value, fallback = pendingText()) => {
  const date = toValidDate(value)
  if (!date) return fallback

  return date.toLocaleString(getLocale(), {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/** Chỉ ngày, VD: "10/07/2026" */
export const formatDate = (value, fallback = pendingText()) => {
  const date = toValidDate(value)
  if (!date) return fallback

  return date.toLocaleDateString(getLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Khoảng thời gian, VD: "10 thg 7, 2026, 09:00 - 11:00" */
export const formatTimeRange = (
  startValue,
  endValue,
  { fallback = pendingText(), weekday = false, separator = ', ' } = {},
) => {
  const start = toValidDate(startValue)
  if (!start) return fallback

  const end = toValidDate(endValue)

  const dateText = start.toLocaleDateString(
    getLocale(),
    weekday
      ? { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' },
  )

  const timeOptions = { hour: '2-digit', minute: '2-digit' }
  const startText = start.toLocaleTimeString(getLocale(), timeOptions)

  if (!end) return `${dateText}${separator}${startText}`

  const endText = end.toLocaleTimeString(getLocale(), timeOptions)

  return `${dateText}${separator}${startText} - ${endText}`
}

/** "BOARD_GAME" -> "Board Game" */
export const formatEnumLabel = (value, fallback = '') => {
  if (!value) return fallback

  return String(value)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Chuẩn hóa bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu */
export const removeVietnameseTones = (str) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
}

/** So sánh tìm kiếm thông minh: hỗ trợ cả có dấu và không dấu */
export const matchSearchText = (target, search) => {
  if (!target || !search) return false
  const t = String(target).toLowerCase().trim()
  const s = String(search).toLowerCase().trim()
  if (t.includes(s)) return true
  return removeVietnameseTones(t).includes(removeVietnameseTones(s))
}
