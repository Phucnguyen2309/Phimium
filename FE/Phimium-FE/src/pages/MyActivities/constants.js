const placeholderImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="360">
    <rect width="100%" height="100%" fill="#dbeafe"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="24" fill="#1d4ed8">
      Hoạt động PHIMIUM
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

export const ACTIVITY_STATUS_UI = {
  PUBLISHED: 'PUBLISHED',
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

export const ACTIVITY_STATUS_LABELS = {
  PUBLISHED: 'Đã đăng',
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
}

export const DEFAULT_ACTIVITY = {
  id: '',
  title: 'Hoạt động chưa đặt tên',
  description: '',
  hostName: 'Buddy chưa xác định',
  hostAvatar: PLACEHOLDER_AVATAR,
  imageUrl: PLACEHOLDER_IMAGE,
  category: 'ACTIVITY',
  status: 'PUBLISHED',
  statusLabel: 'Đã đăng',
  time: 'Sắp cập nhật',
  location: 'Sắp cập nhật',
  address: '',
  rating: 5,
  action: '',
  participationFee: 0,
  minimumParticipants: 0,
  maximumParticipants: 0,
  groupMinSize: 0,
  groupMaxSize: 0,
  longitude: null,
  latitude: null,
}

export const ACTIVITY_TABS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Sắp diễn ra', value: 'UPCOMING' },
  { label: 'Đang diễn ra', value: 'ONGOING' },
  { label: 'Đã hoàn thành', value: 'COMPLETED' },
]
