import { t } from '@/utils/i18n.js'

const placeholderImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="360">
    <rect width="100%" height="100%" fill="#dbeafe"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="24" fill="#1d4ed8">
      PHIMIUM
    </text>
  </svg>
`)}`

const placeholderAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
    <rect width="100%" height="100%" rx="40" fill="#e0f2fe"/>
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="24" fill="#0369a1">
      P
    </text>
  </svg>
`)}`

export const PLACEHOLDER_IMAGE = placeholderImage
export const PLACEHOLDER_AVATAR = placeholderAvatar

/** Giá trị mặc định khi API thiếu field (text lấy theo ngôn ngữ hiện tại) */
export const getDefaultActivity = () => ({
  id: '',
  title: t('activity.untitled'),
  description: '',
  hostName: t('activity.unknownBuddy'),
  hostAvatar: PLACEHOLDER_AVATAR,
  imageUrl: PLACEHOLDER_IMAGE,
  category: 'ACTIVITY',
  status: 'PUBLISHED',
  statusLabel: t('activityStatus.PUBLISHED'),
  time: t('common.comingSoon'),
  location: t('common.comingSoon'),
  address: '',
  participationFee: 0,
  minimumParticipants: 0,
  maximumParticipants: 0,
  groupMinSize: 0,
  groupMaxSize: 0,
  longitude: null,
  latitude: null,
})

export const ACTIVITY_TABS = [
  { labelKey: 'common.all', value: 'ALL' },
  { labelKey: 'activityStatus.UPCOMING', value: 'UPCOMING' },
  { labelKey: 'activityStatus.ONGOING', value: 'ONGOING' },
  { labelKey: 'activityStatus.COMPLETED', value: 'COMPLETED' },
]
