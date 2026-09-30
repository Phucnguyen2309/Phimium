import { getCoordinates } from '@/utils/geo.js'
import { t } from '@/utils/i18n.js'
import { getValidText } from '@/utils/text.js'

export const ALL_TYPES = 'ALL'

/** Danh sách loại hoạt động có trong dữ liệu, luôn bắt đầu bằng 'ALL'. */
export const getActivityTypes = (activities) => [
  ALL_TYPES,
  ...new Set(activities.map((activity) => activity.activityType).filter(Boolean)),
]

/** Gom các Buddy đang tổ chức hoạt động (lấy từ dữ liệu activity thật). */
export const getBuddiesFromActivities = (activities, limit = 3) => {
  const buddies = new Map()

  activities.forEach((activity) => {
    const name = getValidText(activity.hostBuddyName)
    if (!name || name === t('activity.unknownBuddy')) return

    const key = activity.hostBuddyId ?? name
    const current = buddies.get(key) ?? {
      id: key,
      name,
      activityTitles: [],
      activityTypes: new Set(),
    }

    current.activityTitles.push(activity.title)
    if (activity.activityType) current.activityTypes.add(activity.activityType)

    buddies.set(key, current)
  })

  return [...buddies.values()]
    .sort((a, b) => b.activityTitles.length - a.activityTitles.length)
    .slice(0, limit)
    .map((buddy) => ({
      ...buddy,
      activityTypes: [...buddy.activityTypes],
    }))
}

/** Các điểm hẹn (địa điểm) khác nhau của hoạt động, kèm toạ độ thật nếu Backend có. */
export const getMeetingPoints = (activities, limit = 5) => {
  const points = new Map()

  activities.forEach((activity) => {
    const name = getValidText(activity.locationName)
    const address = getValidText(activity.address)
    const key = name || address
    const coordinates = getCoordinates(activity)

    if (!key) return

    const current = points.get(key)

    // Điểm đã có nhưng chưa có toạ độ -> bổ sung từ activity khác cùng địa điểm
    if (current) {
      if (!current.latitude && coordinates) {
        current.latitude = coordinates.lat
        current.longitude = coordinates.lng
      }
      return
    }

    points.set(key, {
      id: key,
      name: name || address,
      address,
      latitude: coordinates?.lat ?? null,
      longitude: coordinates?.lng ?? null,
    })
  })

  return [...points.values()].slice(0, limit)
}
