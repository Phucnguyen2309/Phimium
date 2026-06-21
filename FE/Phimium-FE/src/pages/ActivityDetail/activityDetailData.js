export const fallbackDetails = {
  pottery: {
    title: 'Artisanal Pottery Workshop',
    description:
      'Master the wheel with professional local ceramists and create your own ceramic piece.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-10T09:00:00',
    locationName: 'Clay Studio District',
    address: '12 Nguyen Trai, District 1, Ho Chi Minh City',
    participationFee: 450000,
    groupMinSize: 4,
    groupMaxSize: 6,
    hostBuddyName: 'Buddy Linh',
    activityType: 'Workshop',
  },
  coffee: {
    title: 'Urban Specialty Coffee',
    description:
      'Taste curated roasts and connect with nearby buddies in a relaxed cafe vibe.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-11T14:00:00',
    locationName: 'District 1',
    address: '88 Le Lai, District 1, Ho Chi Minh City',
    participationFee: 0,
    groupMinSize: 4,
    groupMaxSize: 6,
    hostBuddyName: 'Buddy Minh',
    activityType: 'Coffee Chat',
  },
  rooftop: {
    title: 'Rooftop Socials',
    description: 'Evening social events with skyline views and new companions.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-12T18:30:00',
    locationName: 'Skyline Rooftop',
    address: '2 Nguyen Hue, District 1, Ho Chi Minh City',
    participationFee: 280000,
    groupMinSize: 4,
    groupMaxSize: 6,
    hostBuddyName: 'Buddy An',
    activityType: 'Social',
  },
  cowork: {
    title: 'Cowork & Connect',
    description:
      'A calm workspace for creators and remote workers to meet and collaborate.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-13T10:00:00',
    locationName: 'Shared Studio',
    address: '45 Nguyen Thi Minh Khai, District 3, Ho Chi Minh City',
    participationFee: 120000,
    groupMinSize: 4,
    groupMaxSize: 6,
    hostBuddyName: 'Buddy Hoa',
    activityType: 'Coworking',
  },
}

export const getFallbackActivity = (id, stateActivity) =>
  stateActivity ?? fallbackDetails[id] ?? fallbackDetails.pottery

export const formatDateTime = (dateValue) => {
  if (!dateValue) return 'TBA'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'TBA'

  return date.toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export const formatMoney = (value) => {
  const amount = Number(value)
  if (!amount || amount <= 0) return 'Free'
  return `${amount.toLocaleString('vi-VN')} VND`
}
