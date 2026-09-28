export const fallbackGuidelines = {
  pottery: {
    instructions:
      'Mặc trang phục thoải mái và làm theo hướng dẫn của người hướng dẫn từng bước.',
    safetyGuidelines:
      'Giữ tay xa bàn xoay khi đang quay. Uống đủ nước và tuân thủ quy tắc của địa điểm.',
  },
  coffee: {
    instructions: 'Đến đúng giờ và sẵn sàng trò chuyện cùng nhóm.',
    safetyGuidelines: 'Tôn trọng không gian cá nhân và làm theo hướng dẫn của nhân viên quán.',
  },
  rooftop: {
    instructions: 'Mang theo năng lượng tích cực và sẵn sàng kết nối với mọi người.',
    safetyGuidelines:
      'Ở trong khu vực được chỉ định và tránh các vị trí mép không an toàn.',
  },
  cowork: {
    instructions:
      'Mang theo laptop hoặc sổ tay và giữ không gian làm việc gọn gàng.',
    safetyGuidelines: 'Tôn trọng khu vực yên tĩnh và thiết bị dùng chung.',
  },
}

export const getFallbackGuideline = (id) =>
  fallbackGuidelines[id] ?? fallbackGuidelines.pottery
