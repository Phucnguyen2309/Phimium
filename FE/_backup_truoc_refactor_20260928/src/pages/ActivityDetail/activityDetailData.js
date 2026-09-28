export const fallbackDetails = {
  pottery: {
    title: 'Workshop làm gốm thủ công',
    description:
      'Học cách dùng bàn xoay cùng nghệ nhân địa phương và tạo sản phẩm gốm của riêng bạn.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-10T09:00:00',
    locationName: 'Khu Clay Studio',
    address: '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
    participationFee: 450000,
    groupMinSize: 4,
    groupMaxSize: 6,
    hostBuddyName: 'Buddy Linh',
    activityType: 'Workshop',
  },
  coffee: {
    title: 'Cafe specialty trong thành phố',
    description:
      'Thưởng thức các loại cà phê được chọn lọc và kết nối với Buddy gần đó trong không gian cafe thư giãn.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-11T14:00:00',
    locationName: 'Quận 1',
    address: '88 Lê Lai, Quận 1, TP. Hồ Chí Minh',
    participationFee: 0,
    groupMinSize: 4,
    groupMaxSize: 6,
    hostBuddyName: 'Buddy Minh',
    activityType: 'Coffee Chat',
  },
  rooftop: {
    title: 'Gặp gỡ trên sân thượng',
    description: 'Buổi tối social với view skyline và những người bạn mới.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-12T18:30:00',
    locationName: 'Skyline Rooftop',
    address: '2 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    participationFee: 280000,
    groupMinSize: 4,
    groupMaxSize: 6,
    hostBuddyName: 'Buddy An',
    activityType: 'Social',
  },
  cowork: {
    title: 'Cowork & Connect',
    description:
      'Không gian làm việc yên tĩnh cho creator và remote worker gặp gỡ, cộng tác.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-13T10:00:00',
    locationName: 'Shared Studio',
    address: '45 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh',
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
  if (!dateValue) return 'Sắp cập nhật'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Sắp cập nhật'

  return date.toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export const formatMoney = (value) => {
  const amount = Number(value)
  if (!amount || amount <= 0) return 'Miễn phí'
  return `${amount.toLocaleString('vi-VN')} VND`
}
