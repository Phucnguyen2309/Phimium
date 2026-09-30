import {
  getDurationMinutes,
  getUpcomingDepartures,
} from '@/features/activity/activityMapper.js'
import { getValidText } from '@/utils/text.js'

export const ANY = 'ANY'

export const DEFAULT_FILTERS = {
  type: ANY,
  groupSize: ANY,
  duration: ANY,
  date: ANY,
  location: ANY,
}

// Số khách trong nhóm của người đặt -> tour phải nhận được tối thiểu ngần ấy khách
export const GROUP_SIZE_OPTIONS = [
  { value: ANY, labelKey: 'activities.filters.groupSizeAny' },
  { value: '1', labelKey: 'activities.filters.groupSizeSolo', size: 1 },
  { value: '2', labelKey: 'activities.filters.groupSizeCouple', size: 2 },
  { value: '4', labelKey: 'activities.filters.groupSizeSmall', size: 4 },
  { value: '6', labelKey: 'activities.filters.groupSizeLarge', size: 6 },
]

export const DURATION_OPTIONS = [
  { value: ANY, labelKey: 'activities.filters.durationAny' },
  { value: 'SHORT', labelKey: 'activities.filters.durationShort', max: 180 },
  { value: 'HALF_DAY', labelKey: 'activities.filters.durationHalfDay', min: 180, max: 300 },
  { value: 'LONG', labelKey: 'activities.filters.durationLong', min: 300 },
]

export const DATE_OPTIONS = [
  { value: ANY, labelKey: 'activities.filters.dateAny' },
  { value: 'TODAY', labelKey: 'activities.filters.dateToday' },
  { value: 'TOMORROW', labelKey: 'activities.filters.dateTomorrow' },
  { value: 'WEEKEND', labelKey: 'activities.filters.dateWeekend' },
  { value: 'NEXT_7_DAYS', labelKey: 'activities.filters.dateNext7Days' },
]

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

// Khoảng ngày [from, to) cho từng lựa chọn ngày khởi hành
const getDateRange = (value, now) => {
  const today = startOfDay(now)

  switch (value) {
    case 'TODAY':
      return [today, addDays(today, 1)]
    case 'TOMORROW':
      return [addDays(today, 1), addDays(today, 2)]
    case 'WEEKEND': {
      const day = today.getDay()
      const saturday = day === 0 ? addDays(today, -1) : addDays(today, 6 - day)
      return [saturday, addDays(saturday, 2)]
    }
    case 'NEXT_7_DAYS':
      return [today, addDays(today, 7)]
    default:
      return null
  }
}

/** Sức chứa tối đa của một nhóm trong tour */
export const getMaxGroupSize = (activity) =>
  Number(activity?.groupMaxSize) || Number(activity?.maximumParticipants) || 0

/** Các điểm hẹn khác nhau có trong dữ liệu (dùng cho ô chọn khu vực). */
export const getLocationOptions = (activities) => [
  ...new Set(activities.map((activity) => getValidText(activity.locationName)).filter(Boolean)),
].sort((a, b) => a.localeCompare(b))

/** Các loại tour có trong dữ liệu, luôn bắt đầu bằng ANY. */
export const getTypeOptions = (activities) => [
  ANY,
  ...new Set(activities.map((activity) => activity.activityType).filter(Boolean)),
]

const matchKeyword = (activity, keyword) => {
  if (!keyword) return true

  return [activity.title, activity.description, activity.locationName, activity.address]
    .filter(Boolean)
    .some((text) => text.toLowerCase().includes(keyword))
}

const matchGroupSize = (activity, value) => {
  const option = GROUP_SIZE_OPTIONS.find((item) => item.value === value)
  if (!option?.size) return true

  return getMaxGroupSize(activity) >= option.size
}

const matchDuration = (activity, value) => {
  const option = DURATION_OPTIONS.find((item) => item.value === value)
  if (!option || option.value === ANY) return true

  const minutes = getDurationMinutes(activity)
  if (!minutes) return false

  return (option.min === undefined || minutes >= option.min) &&
    (option.max === undefined || minutes <= option.max)
}

const matchDate = (activity, value, now) => {
  const range = getDateRange(value, now)
  if (!range) return true

  const [from, to] = range

  return getUpcomingDepartures(activity, now).some(
    (departure) => departure.start >= from && departure.start < to,
  )
}

export const filterTours = (activities, filters, keyword = '', now = new Date()) => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  return activities.filter(
    (activity) =>
      (filters.type === ANY || activity.activityType === filters.type) &&
      (filters.location === ANY || getValidText(activity.locationName) === filters.location) &&
      matchGroupSize(activity, filters.groupSize) &&
      matchDuration(activity, filters.duration) &&
      matchDate(activity, filters.date, now) &&
      matchKeyword(activity, normalizedKeyword),
  )
}
