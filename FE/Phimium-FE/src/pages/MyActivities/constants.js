const placeholderImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="360">
    <rect width="100%" height="100%" fill="#dbeafe"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="24" fill="#1d4ed8">
      PHIMIUM Activity
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
  PUBLISHED: 'Published',
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const DEFAULT_ACTIVITY = {
  id: '',
  title: 'Untitled Activity',
  description: '',
  hostName: 'Unknown host',
  hostAvatar: PLACEHOLDER_AVATAR,
  imageUrl: PLACEHOLDER_IMAGE,
  category: 'ACTIVITY',
  status: 'PUBLISHED',
  statusLabel: 'Published',
  time: 'TBA',
  location: 'TBA',
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
  { label: 'All Activities', value: 'ALL' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]